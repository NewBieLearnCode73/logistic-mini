import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, getLoginToken, cleanupCreatedEntities } from '../test-helpers';
import { DataSource } from 'typeorm';

describe('BatchModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let mfrToken: string;
  let retToken: string;
  let db: DataSource;

  const createdBatchIds: string[] = [];
  const createdProductIds: string[] = [];
  let testProductId: string;

  // Manufacturer's node: 550e8400-e29b-41d4-a716-446655440001 (Nhà Máy Hà Tiên - TP.HCM)
  // Retailer's node: 550e8400-e29b-41d4-a716-446655440007 (Siêu Thị Co.opmart Cống Quỳnh - TP.HCM)
  const mfrNodeId = '550e8400-e29b-41d4-a716-446655440001';
  const retNodeId = '550e8400-e29b-41d4-a716-446655440007';

  beforeAll(async () => {
    app = await bootstrapTestApp();
    db = app.get(DataSource);

    adminToken = await getLoginToken(app, 'admin@logistic.com');
    mfrToken = await getLoginToken(app, 'mfr_a@logistic.com');
    retToken = await getLoginToken(app, 'ret_a@logistic.com');

    // Create a product to associate batches with
    const resProd = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Sản phẩm Test Batch',
        sku: 'SKU-BATCH-TEST',
        unit: 'Hộp',
        unitPrice: 100,
        category: 'Dược phẩm',
      })
      .expect(201);

    testProductId = resProd.body.id;
    createdProductIds.push(testProductId);
  });

  afterAll(async () => {
    // Delete any created inventory records first
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

  describe('POST /api/v1/batches - TC-FN-01', () => {
    it('should successfully create a batch as Manufacturer (Happy Path)', async () => {
      const manufactureDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6);

      const res = await request(app.getHttpServer())
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          productId: testProductId,
          quantity: 1000,
          unit: 'Hộp',
          manufactureDate: manufactureDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('batchCode');
      expect(res.body.status).toBe('CREATED');
      expect(res.body.quantity).toBe(1000);
      expect(res.body.originNodeId).toBe(mfrNodeId);

      createdBatchIds.push(res.body.id);

      // Verify DB State: Inventory at origin node increased by 1000
      const inv = await db.query(
        `SELECT quantity_available FROM inventory WHERE batch_id = $1 AND node_id = $2`,
        [res.body.id, mfrNodeId],
      );
      expect(Number(inv[0].quantity_available)).toBe(1000);

      // Verify DB State: Timeline event created
      const events = await db.query(
        `SELECT event_type, quantity_delta FROM timeline_events WHERE batch_id = $1`,
        [res.body.id],
      );
      expect(events.length).toBe(1);
      expect(events[0].event_type).toBe('CREATED');
      expect(Number(events[0].quantity_delta)).toBe(1000);
    });

    it('should throw 400 if expiry date is before or equal to manufacture date', async () => {
      const mDate = new Date();
      const eDate = new Date(mDate.getTime() - 1000);

      const res = await request(app.getHttpServer())
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          productId: testProductId,
          quantity: 100,
          manufactureDate: mDate.toISOString(),
          expiryDate: eDate.toISOString(),
        })
        .expect(400);

      expect(res.body.message).toContain('Hạn sử dụng phải lớn hơn ngày sản xuất');
    });

    it('should throw 400 if quantity <= 0', async () => {
      const mDate = new Date();
      const eDate = new Date();
      eDate.setMonth(eDate.getMonth() + 3);

      await request(app.getHttpServer())
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          productId: testProductId,
          quantity: 0,
          manufactureDate: mDate.toISOString(),
          expiryDate: eDate.toISOString(),
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/batches', () => {
    it('should retrieve list of batches', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/batches')
        .set('Authorization', `Bearer ${mfrToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/batches/:id/timeline', () => {
    it('should retrieve timeline events', async () => {
      const batchId = createdBatchIds[0];
      const res = await request(app.getHttpServer())
        .get(`/api/v1/batches/${batchId}/timeline`)
        .set('Authorization', `Bearer ${mfrToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].eventType).toBe('CREATED');
    });
  });

  describe('POST /api/v1/batches/:id/regenerate-qr', () => {
    it('should allow manufacturer to regenerate QR code metadata', async () => {
      const batchId = createdBatchIds[0];
      const res = await request(app.getHttpServer())
        .post(`/api/v1/batches/${batchId}/regenerate-qr`)
        .set('Authorization', `Bearer ${mfrToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('qrImageUrl');
      expect(res.body.qrImageUrl).toContain('data:image/png;base64');
    });
  });

  describe('POST /api/v1/batches/:id/sell', () => {
    let targetBatchId: string;

    beforeAll(async () => {
      // Create a specific batch for selling
      const manufactureDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6);

      const res = await request(app.getHttpServer())
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          productId: testProductId,
          quantity: 200,
          unit: 'Hộp',
          manufactureDate: manufactureDate.toISOString(),
          expiryDate: expiryDate.toISOString(),
        })
        .expect(201);

      targetBatchId = res.body.id;
      createdBatchIds.push(targetBatchId);

      // Artificially seed/transfer inventory to the retailer's node to test sell logic
      await db.query(
        `INSERT INTO inventory (batch_id, node_id, quantity_available, last_updated_at, version)
         VALUES ($1, $2, 100, NOW(), 1)`,
        [targetBatchId, retNodeId],
      );
    });

    it('should allow Retailer to sell from batch when stock is available', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/batches/${targetBatchId}/sell`)
        .set('Authorization', `Bearer ${retToken}`)
        .send({ quantity: 40 })
        .expect(200);

      // Verify inventory decreased to 60
      const inv = await db.query(
        `SELECT quantity_available FROM inventory WHERE batch_id = $1 AND node_id = $2`,
        [targetBatchId, retNodeId],
      );
      expect(Number(inv[0].quantity_available)).toBe(60);

      // Verify sell event written to timeline
      const sellEvent = await db.query(
        `SELECT event_type, quantity_delta FROM timeline_events WHERE batch_id = $1 AND event_type = 'SOLD'`,
        [targetBatchId],
      );
      expect(sellEvent.length).toBe(1);
      expect(Number(sellEvent[0].quantity_delta)).toBe(-40);
    });

    it('should throw 400 if quantity exceeds available inventory', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/batches/${targetBatchId}/sell`)
        .set('Authorization', `Bearer ${retToken}`)
        .send({ quantity: 100 })
        .expect(400);

      expect(res.body.message).toContain('Không đủ số lượng hàng tồn kho khả dụng để bán. Hiện có: 60');
    });

    it('should update batch status to SOLD when inventory reaches 0', async () => {
      // Sell the remaining 60 units
      const res = await request(app.getHttpServer())
        .post(`/api/v1/batches/${targetBatchId}/sell`)
        .set('Authorization', `Bearer ${retToken}`)
        .send({ quantity: 60 })
        .expect(200);

      // Verify batch status transitioned to SOLD
      const batch = await db.query(`SELECT status FROM batches WHERE id = $1`, [targetBatchId]);
      expect(batch[0].status).toBe('SOLD');
    });
  });
});
