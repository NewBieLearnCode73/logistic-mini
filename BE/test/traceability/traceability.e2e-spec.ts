import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, getLoginToken, cleanupCreatedEntities } from '../test-helpers';
import { DataSource } from 'typeorm';

describe('TraceabilityModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let mfrToken: string;
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
  });
});
