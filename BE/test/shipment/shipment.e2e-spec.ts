import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, getLoginToken, cleanupCreatedEntities } from '../test-helpers';
import { DataSource } from 'typeorm';

describe('ShipmentModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let mfrToken: string;
  let distToken: string;
  let retToken: string;
  let db: DataSource;

  const createdBatchIds: string[] = [];
  const createdProductIds: string[] = [];
  const createdShipmentIds: string[] = [];
  let testProductId: string;

  // Manufacturer's node: 550e8400-e29b-41d4-a716-446655440001 (Nhà Máy Hà Tiên - TP.HCM)
  // Distributor's node: 550e8400-e29b-41d4-a716-446655440003 (Trung Tâm Phân Phối Đà Nẵng)
  // Retailer's node: 550e8400-e29b-41d4-a716-446655440007 (Siêu Thị Co.opmart Cống Quỳnh - TP.HCM)
  const mfrNodeId = '550e8400-e29b-41d4-a716-446655440001';
  const distNodeId = '550e8400-e29b-41d4-a716-446655440003';
  const retNodeId = '550e8400-e29b-41d4-a716-446655440007';

  beforeAll(async () => {
    app = await bootstrapTestApp();
    db = app.get(DataSource);

    adminToken = await getLoginToken(app, 'admin@logistic.com');
    mfrToken = await getLoginToken(app, 'mfr_a@logistic.com');
    distToken = await getLoginToken(app, 'dist_a@logistic.com');
    retToken = await getLoginToken(app, 'ret_a@logistic.com');

    // Create a product
    const resProd = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Sản phẩm Test Shipment',
        sku: 'SKU-SHIPMENT-TEST',
        unit: 'Hộp',
        unitPrice: 150,
        category: 'Dược phẩm',
      })
      .expect(201);

    testProductId = resProd.body.id;
    createdProductIds.push(testProductId);
  });

  afterAll(async () => {
    // Delete any created inventory, timeline, and shipment records first
    if (createdShipmentIds.length) {
      await db.query(`DELETE FROM timeline_events WHERE shipment_id = ANY($1)`, [createdShipmentIds]);
      await db.query(`DELETE FROM shipments WHERE id = ANY($1)`, [createdShipmentIds]);
    }
    if (createdBatchIds.length) {
      await db.query(`DELETE FROM inventory WHERE batch_id = ANY($1)`, [createdBatchIds]);
      await db.query(`DELETE FROM timeline_events WHERE batch_id = ANY($1)`, [createdBatchIds]);
    }
    await cleanupCreatedEntities(app, {
      batchIds: createdBatchIds,
      productIds: createdProductIds,
    });
    await app.close();
  });

  describe('POST /api/v1/shipments - TC-FN-02', () => {
    let batchId: string;

    beforeEach(async () => {
      // Create a fresh batch with 500 units for each test case
      const manufactureDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6);

      const res = await request(app.getHttpServer())
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          productId: testProductId,
          quantity: 500,
          unit: 'Hộp',
          manufactureDate: manufactureDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
        })
        .expect(201);

      batchId = res.body.id;
      createdBatchIds.push(batchId);
    });

    it('should successfully create shipment as Manufacturer (Happy Path)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          batchId,
          destinationNodeId: distNodeId,
          quantityShipped: 300,
          notes: 'Test shipment transfer 1',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('trackingCode');
      expect(res.body.status).toBe('IN_TRANSIT');
      expect(res.body.quantityShipped).toBe(300);
      expect(res.body.sourceNodeId).toBe(mfrNodeId);
      expect(res.body.destinationNodeId).toBe(distNodeId);

      createdShipmentIds.push(res.body.id);

      // Verify DB State: source inventory is deducted to 200 (500 - 300)
      const inv = await db.query(
        `SELECT quantity_available FROM inventory WHERE batch_id = $1 AND node_id = $2`,
        [batchId, mfrNodeId],
      );
      expect(Number(inv[0].quantity_available)).toBe(200);

      // Verify DB State: batch status is set to IN_TRANSIT
      const batch = await db.query(`SELECT status FROM batches WHERE id = $1`, [batchId]);
      expect(batch[0].status).toBe('IN_TRANSIT');

      // Verify DB State: timeline event SHIPPED is logged with negative delta
      const event = await db.query(
        `SELECT event_type, quantity_delta FROM timeline_events WHERE batch_id = $1 AND shipment_id = $2`,
        [batchId, res.body.id],
      );
      expect(event.length).toBe(1);
      expect(event[0].event_type).toBe('SHIPPED');
      expect(Number(event[0].quantity_delta)).toBe(-300);
    });

    it('should throw 400 Bad Request if quantity exceeds inventory', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          batchId,
          destinationNodeId: distNodeId,
          quantityShipped: 600,
        })
        .expect(400);

      expect(res.body.message).toContain('Không đủ số lượng hàng tồn kho để xuất. Hiện có: 500');
    });

    it('should throw 400 if source and destination nodes are identical', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          batchId,
          destinationNodeId: mfrNodeId,
          quantityShipped: 100,
        })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/shipments/:id/receive - TC-FN-03', () => {
    let shipmentId: string;
    let batchId: string;

    beforeEach(async () => {
      // Create fresh batch
      const manufactureDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6);

      const resBatch = await request(app.getHttpServer())
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          productId: testProductId,
          quantity: 500,
          manufactureDate: manufactureDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
        })
        .expect(201);

      batchId = resBatch.body.id;
      createdBatchIds.push(batchId);

      // Create shipment to Distributor
      const resShip = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          batchId,
          destinationNodeId: distNodeId,
          quantityShipped: 400,
        })
        .expect(201);

      shipmentId = resShip.body.id;
      createdShipmentIds.push(shipmentId);
    });

    it('should allow user at the destination node to receive the shipment (Happy Path)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/receive`)
        .set('Authorization', `Bearer ${distToken}`)
        .expect(200);

      expect(res.body.status).toBe('RECEIVED');
      expect(res.body).toHaveProperty('actualDeliveryDate');

      // Verify DB State: Destination inventory UPSERTed to 400
      const invDest = await db.query(
        `SELECT quantity_available FROM inventory WHERE batch_id = $1 AND node_id = $2`,
        [batchId, distNodeId],
      );
      expect(Number(invDest[0].quantity_available)).toBe(400);

      // Verify DB State: Batch location and status updated
      const batch = await db.query(`SELECT current_node_id, status FROM batches WHERE id = $1`, [batchId]);
      expect(batch[0].current_node_id).toBe(distNodeId);
      expect(batch[0].status).toBe('RECEIVED');

      // Verify DB State: Timeline event RECEIVED written
      const event = await db.query(
        `SELECT event_type, quantity_delta, node_id FROM timeline_events WHERE batch_id = $1 AND shipment_id = $2 AND event_type = 'RECEIVED'`,
        [batchId, shipmentId],
      );
      expect(event.length).toBe(1);
      expect(event[0].node_id).toBe(distNodeId);
      expect(Number(event[0].quantity_delta)).toBe(400);
    });

    it('should forbid user at a different node from receiving the shipment', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/receive`)
        .set('Authorization', `Bearer ${retToken}`) // Retailer (Co.opmart) node instead of Distributor (Đà Nẵng) node
        .expect(403);

      expect(res.body.message).toContain('Bạn không thuộc Node nhận của vận đơn này');
    });

    it('should prevent double receiving a shipment', async () => {
      // Receive successfully first
      await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/receive`)
        .set('Authorization', `Bearer ${distToken}`)
        .expect(200);

      // Try receiving again
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/receive`)
        .set('Authorization', `Bearer ${distToken}`)
        .expect(400);

      expect(res.body.message).toContain('Vận đơn không ở trạng thái đang vận chuyển (IN_TRANSIT)');
    });
  });
});
