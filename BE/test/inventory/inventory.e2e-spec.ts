import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, getLoginToken, cleanupCreatedEntities } from '../test-helpers';
import { DataSource } from 'typeorm';

describe('InventoryAndNodesModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let mfrToken: string;
  let db: DataSource;

  const createdBatchIds: string[] = [];
  const createdProductIds: string[] = [];
  const createdNodeIds: string[] = [];

  beforeAll(async () => {
    app = await bootstrapTestApp();
    db = app.get(DataSource);

    adminToken = await getLoginToken(app, 'admin@logistic.com');
    mfrToken = await getLoginToken(app, 'mfr_a@logistic.com');
  });

  afterAll(async () => {
    // Cleanup inventory records
    if (createdBatchIds.length) {
      await db.query(`DELETE FROM inventory WHERE batch_id = ANY($1)`, [createdBatchIds]);
      await db.query(`DELETE FROM timeline_events WHERE batch_id = ANY($1)`, [createdBatchIds]);
    }
    await cleanupCreatedEntities(app, {
      batchIds: createdBatchIds,
      productIds: createdProductIds,
      nodeIds: createdNodeIds,
    });
    await app.close();
  });

  describe('GET /api/v1/nodes', () => {
    it('should retrieve list of nodes', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/nodes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should retrieve list of nodes including inventory details', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/nodes')
        .query({ includeInventory: 'true' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data[0]).toHaveProperty('inventories');
      expect(Array.isArray(res.body.data[0].inventories)).toBe(true);
    });
  });

  describe('TC-CC-06 - Node Optimistic Locking & Deletion Constraints', () => {
    let node1Id: string;

    beforeAll(async () => {
      // 1. Create a node for testing collision and locking
      const resNode = await request(app.getHttpServer())
        .post('/api/v1/nodes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Điểm Nút Test Concurrency',
          nodeType: 'WAREHOUSE',
          address: '456 Test Road, HCMC',
          latitude: 10.1234,
          longitude: 106.1234,
        })
        .expect(201);

      node1Id = resNode.body.id;
      createdNodeIds.push(node1Id);
    });

    it('should conflict when updating a node with an outdated version (Optimistic Lock)', async () => {
      // Admin 1 reads node details (version = 1)
      const nodeInfo = await request(app.getHttpServer())
        .get(`/api/v1/nodes/${node1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(nodeInfo.body.version).toBe(1);

      // Admin 1 updates the name first (version becomes 2 in database)
      await request(app.getHttpServer())
        .put(`/api/v1/nodes/${node1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Điểm Nút Test Concurrency Update 1',
        })
        .expect(200);
      // Admin 2 tries to update with outdated version 1
      const res = await request(app.getHttpServer())
        .put(`/api/v1/nodes/${node1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Điểm Nút Test Concurrency Update 2',
          version: 1,
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng tải lại trang.');
    });

    it('should throw 400 Bad Request when attempting to delete a node that has active inventory', async () => {
      // 1. Create product
      const resProd = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Sản phẩm Test Node Delete',
          sku: 'SKU-NODE-DEL-TEST',
          unit: 'Hộp',
          unitPrice: 10,
        })
        .expect(201);

      createdProductIds.push(resProd.body.id);

      // 2. Create batch at this node
      const resBatch = await request(app.getHttpServer())
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: resProd.body.id,
          quantity: 100,
          manufactureDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          originNodeId: node1Id, // admin sets originNodeId manually
        })
        .expect(201);

      createdBatchIds.push(resBatch.body.id);

      // 3. Try to delete the node
      const resDel = await request(app.getHttpServer())
        .delete(`/api/v1/nodes/${node1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(resDel.body.message).toContain('Cannot delete this node because inventory still exists');
    });
  });
});
