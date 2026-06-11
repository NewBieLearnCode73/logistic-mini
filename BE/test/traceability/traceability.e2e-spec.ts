import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, getLoginToken, cleanupCreatedEntities } from '../test-helpers';
import { DataSource } from 'typeorm';

describe('TraceabilityModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let mfrToken: string;
  let distToken: string;
  let retToken: string;
  let db: DataSource;

  const createdBatchIds: string[] = [];
  const createdProductIds: string[] = [];
  let testProductId: string;
  let testBatchCode: string;
  let testBatchId: string;

  beforeAll(async () => {
    app = await bootstrapTestApp();
    db = app.get(DataSource);

    adminToken = await getLoginToken(app, 'admin@logistic.com');
    mfrToken = await getLoginToken(app, 'mfr_a@logistic.com');
    distToken = await getLoginToken(app, 'dist_a@logistic.com');
    retToken = await getLoginToken(app, 'ret_a@logistic.com');

    // Clean up any leftovers from previous failed runs
    const existingProds = await db.query(`SELECT id FROM products WHERE sku = 'SKU-TRACE-TEST'`);
    if (existingProds.length > 0) {
      const prodId = existingProds[0].id;
      const existingBatches = await db.query(`SELECT id FROM batches WHERE product_id = $1`, [prodId]);
      if (existingBatches.length > 0) {
        const batchIds = existingBatches.map((b: any) => b.id);
        await db.query(`DELETE FROM scan_logs WHERE batch_id = ANY($1)`, [batchIds]);
        await db.query(`DELETE FROM timeline_events WHERE batch_id = ANY($1)`, [batchIds]);
        await db.query(`DELETE FROM inventory WHERE batch_id = ANY($1)`, [batchIds]);
        await db.query(`DELETE FROM shipments WHERE batch_id = ANY($1)`, [batchIds]);
        await db.query(`DELETE FROM batches WHERE id = ANY($1)`, [batchIds]);
      }
      await db.query(`DELETE FROM products WHERE id = $1`, [prodId]);
    }

    // Create product
    const resProd = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Sản phẩm Test Traceability',
        sku: 'SKU-TRACE-TEST',
        unit: 'Hộp',
        unitPrice: 120,
      })
      .expect(201);

    testProductId = resProd.body.id;
    createdProductIds.push(testProductId);

    // Create batch
    const resBatch = await request(app.getHttpServer())
      .post('/api/v1/batches')
      .set('Authorization', `Bearer ${mfrToken}`)
      .send({
        productId: testProductId,
        quantity: 800,
        manufactureDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      })
      .expect(201);

    testBatchId = resBatch.body.id;
    testBatchCode = resBatch.body.batchCode;
    createdBatchIds.push(testBatchId);
  });

  afterAll(async () => {
    // Delete any scan logs, timeline events and inventory entries
    await db.query(`DELETE FROM scan_logs WHERE batch_id = ANY($1)`, [createdBatchIds]);
    await db.query(`DELETE FROM timeline_events WHERE batch_id = ANY($1)`, [createdBatchIds]);
    await db.query(`DELETE FROM inventory WHERE batch_id = ANY($1)`, [createdBatchIds]);
    await db.query(`DELETE FROM shipments WHERE batch_id = ANY($1)`, [createdBatchIds]);

    await cleanupCreatedEntities(app, {
      batchIds: createdBatchIds,
      productIds: createdProductIds,
    });
    await app.close();
  });

  describe('GET /api/v1/public/trace/:batchCode - TC-PB-07', () => {
    it('should successfully retrieve tracing info publicly (No Auth)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/public/trace/${testBatchCode}`)
        .query({
          lat: '21.0285',
          lng: '105.8542',
        })
        .expect(200);

      // Verify returned payload structure
      expect(res.body).toHaveProperty('batch');
      expect(res.body.batch).toHaveProperty('batchCode', testBatchCode);
      expect(res.body.batch.product.name).toBe('Sản phẩm Test Traceability');
      expect(res.body).toHaveProperty('timelineEvents');
      expect(Array.isArray(res.body.timelineEvents)).toBe(true);
      expect(res.body.timelineEvents[0].eventType).toBe('CREATED');

      // Wait a short duration to let fire-and-forget scan log async execution complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify DB State: ScanLog entry has been created with GPS coordinates
      const scanLogs = await db.query(`SELECT * FROM scan_logs WHERE batch_id = $1`, [testBatchId]);
      expect(scanLogs.length).toBe(1);
      expect(parseFloat(scanLogs[0].latitude)).toBeCloseTo(21.0285);
      expect(parseFloat(scanLogs[0].longitude)).toBeCloseTo(105.8542);
    });

    it('should return 404 for non-existent batch code', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/public/trace/BCH-NON-EXISTENT')
        .expect(404);
    });

    it('should filter timeline and simulate batch status/location for Manufacturer', async () => {
      const mfrUser = await db.query(`SELECT * FROM users WHERE email = 'mfr_a@logistic.com'`);
      const mfrNodeId = '550e8400-e29b-41d4-a716-446655440001';
      const distNodeId = '550e8400-e29b-41d4-a716-446655440003';
      const retNodeId = '550e8400-e29b-41d4-a716-446655440007';

      const distNode = (await db.query(`SELECT name, id FROM nodes WHERE id = $1`, [distNodeId]))[0];
      const retNode = (await db.query(`SELECT name, id FROM nodes WHERE id = $1`, [retNodeId]))[0];

      if (!distNode || !retNode) {
        throw new Error('Distributor or Retailer node not found in seeded database');
      }

      const shipmentId1 = '00000000-0000-0000-0000-000000000001';
      const shipmentId2 = '00000000-0000-0000-0000-000000000002';

      await db.query(`DELETE FROM timeline_events WHERE batch_id = $1`, [testBatchId]);
      await db.query(`DELETE FROM shipments WHERE id IN ($1, $2)`, [shipmentId1, shipmentId2]);

      await db.query(`
        INSERT INTO shipments (id, tracking_code, batch_id, source_node_id, destination_node_id, quantity_shipped, status, created_by, created_at)
        VALUES ($1, 'SHP-MOCK-1', $2, $3, $4, 100, 'RECEIVED', $5, NOW() - INTERVAL '2 days')
      `, [shipmentId1, testBatchId, mfrNodeId, distNode.id, mfrUser[0].id]);

      await db.query(`
        INSERT INTO shipments (id, tracking_code, batch_id, source_node_id, destination_node_id, quantity_shipped, status, created_by, created_at)
        VALUES ($1, 'SHP-MOCK-2', $2, $3, $4, 100, 'RECEIVED', $5, NOW() - INTERVAL '1 day')
      `, [shipmentId2, testBatchId, distNode.id, retNode.id, mfrUser[0].id]);

      const eventId1 = '11111111-1111-1111-1111-111111111111';
      await db.query(`
        INSERT INTO timeline_events (id, batch_id, event_type, node_id, actor_id, quantity_delta, occurred_at, notes)
        VALUES ($1, $2, 'CREATED', $3, $4, 800, NOW() - INTERVAL '3 days', 'Created batch')
      `, [eventId1, testBatchId, mfrNodeId, mfrUser[0].id]);

      const eventId2 = '22222222-2222-2222-2222-222222222222';
      await db.query(`
        INSERT INTO timeline_events (id, batch_id, event_type, node_id, actor_id, quantity_delta, occurred_at, notes, shipment_id)
        VALUES ($1, $2, 'SHIPPED', $3, $4, -100, NOW() - INTERVAL '2 days', 'Shipped to Distributor', $5)
      `, [eventId2, testBatchId, mfrNodeId, mfrUser[0].id, shipmentId1]);

      const eventId3 = '33333333-3333-3333-3333-333333333333';
      await db.query(`
        INSERT INTO timeline_events (id, batch_id, event_type, node_id, actor_id, quantity_delta, occurred_at, notes, shipment_id)
        VALUES ($1, $2, 'RECEIVED', $3, $4, 100, NOW() - INTERVAL '2 days', 'Received at Distributor', $5)
      `, [eventId3, testBatchId, distNode.id, mfrUser[0].id, shipmentId1]);

      const eventId4 = '44444444-4444-4444-4444-444444444444';
      await db.query(`
        INSERT INTO timeline_events (id, batch_id, event_type, node_id, actor_id, quantity_delta, occurred_at, notes, shipment_id)
        VALUES ($1, $2, 'SHIPPED', $3, $4, -100, NOW() - INTERVAL '1 day', 'Shipped to Retailer', $5)
      `, [eventId4, testBatchId, distNode.id, mfrUser[0].id, shipmentId2]);

      const eventId5 = '55555555-5555-5555-5555-555555555555';
      await db.query(`
        INSERT INTO timeline_events (id, batch_id, event_type, node_id, actor_id, quantity_delta, occurred_at, notes, shipment_id)
        VALUES ($1, $2, 'RECEIVED', $3, $4, 100, NOW() - INTERVAL '1 day', 'Received at Retailer', $5)
      `, [eventId5, testBatchId, retNode.id, mfrUser[0].id, shipmentId2]);

      const eventId6 = '66666666-6666-6666-6666-666666666666';
      await db.query(`
        INSERT INTO timeline_events (id, batch_id, event_type, node_id, actor_id, quantity_delta, occurred_at, notes)
        VALUES ($1, $2, 'SOLD', $3, $4, -5, NOW(), 'Sold item')
      `, [eventId6, testBatchId, retNode.id, mfrUser[0].id]);

      await db.query(`
        UPDATE batches 
        SET status = 'SOLD', current_node_id = $1 
        WHERE id = $2
      `, [retNode.id, testBatchId]);

      await db.query(`
        INSERT INTO inventory (batch_id, node_id, quantity_available, last_updated_at, version)
        VALUES ($1, $2, 100, NOW(), 1)
      `, [testBatchId, retNode.id]);

      const resGuest = await request(app.getHttpServer())
        .get(`/api/v1/public/trace/${testBatchCode}`)
        .expect(200);

      expect(resGuest.body.timelineEvents.length).toBe(5);
      expect(resGuest.body.timelineEvents.map((e: any) => e.eventType)).toEqual([
        'CREATED',
        'SHIPPED',
        'RECEIVED',
        'SHIPPED',
        'RECEIVED',
      ]);
      expect(resGuest.body.batch.status).toBe('RECEIVED');
      expect(resGuest.body.batch.currentNode.name).toBe(retNode.name);

      const resMfr = await request(app.getHttpServer())
        .get(`/api/v1/public/trace/${testBatchCode}`)
        .set('Authorization', `Bearer ${mfrToken}`)
        .expect(200);

      expect(resMfr.body.timelineEvents.length).toBe(5);
      expect(resMfr.body.timelineEvents.map((e: any) => e.eventType)).toEqual([
        'CREATED',
        'SHIPPED',
        'RECEIVED',
        'SHIPPED',
        'RECEIVED',
      ]);
      expect(resMfr.body.timelineEvents[4].node.name).toBe(retNode.name);
      
      expect(resMfr.body.batch.status).toBe('RECEIVED');
      expect(resMfr.body.batch.currentNode.name).toBe(retNode.name);

      const resUnauthDist = await request(app.getHttpServer())
        .get(`/api/v1/public/trace/${testBatchCode}`)
        .set('Authorization', `Bearer ${distToken}`)
        .expect(400);

      expect(resUnauthDist.body.message).toContain('Lô hàng này chưa từng đi qua cơ sở của bạn');

      const resAdmin = await request(app.getHttpServer())
        .get(`/api/v1/public/trace/${testBatchCode}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(resAdmin.body.timelineEvents.length).toBe(5);

      const resRet = await request(app.getHttpServer())
        .get(`/api/v1/public/trace/${testBatchCode}`)
        .set('Authorization', `Bearer ${retToken}`)
        .expect(200);

      expect(resRet.body.timelineEvents.length).toBe(6);

      await db.query(`DELETE FROM timeline_events WHERE id IN ($1, $2, $3, $4, $5, $6)`, [
        eventId1, eventId2, eventId3, eventId4, eventId5, eventId6
      ]);
      await db.query(`DELETE FROM inventory WHERE batch_id = $1 AND node_id = $2`, [testBatchId, retNode.id]);
      await db.query(`DELETE FROM shipments WHERE id IN ($1, $2)`, [shipmentId1, shipmentId2]);
    });
  });
});
