import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, getLoginToken, cleanupCreatedEntities } from '../test-helpers';
import { DataSource } from 'typeorm';

/**
 * TC-SHIP-FLOW: Luồng tạo và luân chuyển vận đơn (Shipment)
 *
 * Kịch bản tổng thể:
 *   Manufacturer (100 sp) --[ship 30]--> Distributor A --[ship 10]--> Retailer
 *
 * Kiểm tra:
 *  1. Tạo vận đơn: trừ kho nguồn ngay lập tức
 *  2. Kho đích = 0 khi hàng đang IN_TRANSIT
 *  3. Nhận hàng: cộng kho đích (INSERT hoặc UPSERT)
 *  4. Tiếp tục luân chuyển từ kho đích
 *  5. Các validation & phân quyền
 */
describe('Shipment Flow (e2e) - TC-SHIP-FLOW', () => {
  let app: INestApplication;
  let db: DataSource;

  let adminToken: string;
  let mfrToken: string;
  let distToken: string;
  let retToken: string;

  // Node IDs từ seed data
  const mfrNodeId  = '550e8400-e29b-41d4-a716-446655440001'; // Nhà Máy Hà Tiên
  const distNodeId = '550e8400-e29b-41d4-a716-446655440003'; // Trung Tâm Phân Phối Đà Nẵng
  const retNodeId  = '550e8400-e29b-41d4-a716-446655440007'; // Siêu Thị Co.opmart

  // IDs cần dọn dẹp sau test
  const createdProductIds: string[] = [];
  const createdBatchIds:   string[] = [];
  const createdShipmentIds: string[] = [];

  // ─── setup ────────────────────────────────────────────────────────────────
  beforeAll(async () => {
    app = await bootstrapTestApp();
    db  = app.get(DataSource);

    adminToken = await getLoginToken(app, 'admin@logistic.com');
    mfrToken   = await getLoginToken(app, 'mfr_a@logistic.com');
    distToken  = await getLoginToken(app, 'dist_a@logistic.com');
    retToken   = await getLoginToken(app, 'ret_a@logistic.com');
  });

  afterAll(async () => {
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

  // Helper: tạo batch mới tại Manufacturer với số lượng cho trước
  async function createBatch(quantity: number): Promise<string> {
    const mDate = new Date();
    const eDate = new Date();
    eDate.setMonth(eDate.getMonth() + 6);

    const resProd = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `SP Test Flow ${Date.now()}`,
        sku: `SKU-FLOW-${Date.now()}`,
        unit: 'Hộp',
        unitPrice: 50,
      })
      .expect(201);
    createdProductIds.push(resProd.body.id);

    const resBatch = await request(app.getHttpServer())
      .post('/api/v1/batches')
      .set('Authorization', `Bearer ${mfrToken}`)
      .send({
        productId: resProd.body.id,
        quantity,
        unit: 'Hộp',
        manufactureDate: mDate.toISOString(),
        expiryDate: eDate.toISOString(),
      })
      .expect(201);
    createdBatchIds.push(resBatch.body.id);
    return resBatch.body.id;
  }

  // Helper: đọc inventory từ DB
  async function getInventory(batchId: string, nodeId: string): Promise<number | null> {
    const rows = await db.query(
      `SELECT quantity_available FROM inventory WHERE batch_id = $1 AND node_id = $2`,
      [batchId, nodeId],
    );
    return rows.length ? Number(rows[0].quantity_available) : null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. TẠO VẬN ĐƠN — Happy path
  // ═══════════════════════════════════════════════════════════════════════════
  describe('1. Tạo vận đơn (POST /api/v1/shipments)', () => {

    it('TC-SHIP-01: Manufacturer tạo vận đơn 30/100 → kho nguồn trừ ngay còn 70', async () => {
      const batchId = await createBatch(100);

      const res = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId, destinationNodeId: distNodeId, quantityShipped: 30 })
        .expect(201);

      createdShipmentIds.push(res.body.id);

      expect(res.body.status).toBe('IN_TRANSIT');
      expect(res.body.quantityShipped).toBe(30);
      expect(res.body.sourceNodeId).toBe(mfrNodeId);
      expect(res.body.destinationNodeId).toBe(distNodeId);
      expect(res.body).toHaveProperty('trackingCode');
      expect(res.body.trackingCode).toMatch(/^SHP-/);

      // Kho nguồn đã trừ: 100 - 30 = 70
      expect(await getInventory(batchId, mfrNodeId)).toBe(70);

      // Kho đích chưa có record (hàng đang IN_TRANSIT)
      expect(await getInventory(batchId, distNodeId)).toBeNull();

      // Batch status → IN_TRANSIT
      const [batch] = await db.query(`SELECT status FROM batches WHERE id = $1`, [batchId]);
      expect(batch.status).toBe('IN_TRANSIT');

      // Timeline event SHIPPED với delta âm
      const [event] = await db.query(
        `SELECT event_type, quantity_delta FROM timeline_events WHERE batch_id = $1 AND shipment_id = $2`,
        [batchId, res.body.id],
      );
      expect(event.event_type).toBe('SHIPPED');
      expect(Number(event.quantity_delta)).toBe(-30);
    });

    it('TC-SHIP-02: Admin tạo vận đơn với sourceNodeId tường minh', async () => {
      const batchId = await createBatch(50);

      const res = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ batchId, sourceNodeId: mfrNodeId, destinationNodeId: distNodeId, quantityShipped: 20 })
        .expect(201);

      createdShipmentIds.push(res.body.id);
      expect(res.body.sourceNodeId).toBe(mfrNodeId);
      expect(await getInventory(batchId, mfrNodeId)).toBe(30);
    });

    it('TC-SHIP-03: Retailer KHÔNG được tạo vận đơn → 403', async () => {
      const batchId = await createBatch(50);
      await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${retToken}`)
        .send({ batchId, destinationNodeId: distNodeId, quantityShipped: 10 })
        .expect(403);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. VALIDATION KHI TẠO VẬN ĐƠN
  // ═══════════════════════════════════════════════════════════════════════════
  describe('2. Validation tạo vận đơn', () => {

    it('TC-SHIP-04: Số lượng = 0 → 400', async () => {
      const batchId = await createBatch(50);
      await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId, destinationNodeId: distNodeId, quantityShipped: 0 })
        .expect(400);
    });

    it('TC-SHIP-05: Số lượng vượt tồn kho → 400 với message rõ ràng', async () => {
      const batchId = await createBatch(50);
      const res = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId, destinationNodeId: distNodeId, quantityShipped: 999 })
        .expect(400);

      expect(res.body.message).toContain('Không đủ số lượng hàng tồn kho để xuất. Hiện có: 50');
    });

    it('TC-SHIP-06: Kho nguồn = kho đích → 400', async () => {
      const batchId = await createBatch(50);
      await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId, destinationNodeId: mfrNodeId, quantityShipped: 10 })
        .expect(400);
    });

    it('TC-SHIP-07: Batch đang INVESTIGATING → không thể xuất kho → 400', async () => {
      const batchId = await createBatch(50);
      // Force batch status sang INVESTIGATING
      await db.query(`UPDATE batches SET status = 'INVESTIGATING' WHERE id = $1`, [batchId]);

      const res = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId, destinationNodeId: distNodeId, quantityShipped: 10 })
        .expect(400);

      expect(res.body.message).toContain('INVESTIGATING');
      // Restore
      await db.query(`UPDATE batches SET status = 'CREATED' WHERE id = $1`, [batchId]);
    });

    it('TC-SHIP-08: Admin không cung cấp sourceNodeId → 400', async () => {
      const batchId = await createBatch(50);
      await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ batchId, destinationNodeId: distNodeId, quantityShipped: 10 })
        // Admin phải truyền sourceNodeId
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. NHẬN HÀNG TẠI KHO ĐÍCH
  // ═══════════════════════════════════════════════════════════════════════════
  describe('3. Nhận hàng (PATCH /api/v1/shipments/:id/receive)', () => {
    let batchId: string;
    let shipmentId: string;

    beforeAll(async () => {
      batchId = await createBatch(100);

      const res = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId, destinationNodeId: distNodeId, quantityShipped: 40 })
        .expect(201);

      shipmentId = res.body.id;
      createdShipmentIds.push(shipmentId);
    });

    it('TC-SHIP-09: Distributor nhận đủ 40 sp → kho đích +40, batch → RECEIVED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/receive`)
        .set('Authorization', `Bearer ${distToken}`)
        .expect(200);

      expect(res.body.status).toBe('RECEIVED');
      expect(res.body).toHaveProperty('actualDeliveryDate');

      // Kho đích được cộng: 0 + 40 = 40
      expect(await getInventory(batchId, distNodeId)).toBe(40);

      // Batch: currentNode → distNodeId, status → RECEIVED
      const [batch] = await db.query(
        `SELECT status, current_node_id FROM batches WHERE id = $1`, [batchId],
      );
      expect(batch.status).toBe('RECEIVED');
      expect(batch.current_node_id).toBe(distNodeId);

      // Timeline event RECEIVED với delta dương
      const [event] = await db.query(
        `SELECT event_type, quantity_delta, node_id FROM timeline_events
         WHERE batch_id = $1 AND shipment_id = $2 AND event_type = 'RECEIVED'`,
        [batchId, shipmentId],
      );
      expect(event.event_type).toBe('RECEIVED');
      expect(Number(event.quantity_delta)).toBe(40);
      expect(event.node_id).toBe(distNodeId);
    });

    it('TC-SHIP-10: Nhận lần 2 (double-receive) → 400', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/receive`)
        .set('Authorization', `Bearer ${distToken}`)
        .expect(400);

      expect(res.body.message).toMatch(/IN_TRANSIT|DELAYED|trạng thái/i);
    });

    it('TC-SHIP-11: Node sai (Retailer nhận thay Distributor) → 403', async () => {
      // Tạo shipment mới để test
      const b2 = await createBatch(50);
      const resShip = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId: b2, destinationNodeId: distNodeId, quantityShipped: 20 })
        .expect(201);
      createdShipmentIds.push(resShip.body.id);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${resShip.body.id}/receive`)
        .set('Authorization', `Bearer ${retToken}`)
        .expect(403);

      expect(res.body.message).toContain('Bạn không thuộc Node nhận của vận đơn này');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. NHẬN THIẾU (DAMAGED FLOW)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('4. Nhận thiếu — Damaged flow', () => {
    let batchId: string;
    let shipmentId: string;

    beforeAll(async () => {
      batchId = await createBatch(100);

      const res = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId, destinationNodeId: distNodeId, quantityShipped: 50 })
        .expect(201);
      shipmentId = res.body.id;
      createdShipmentIds.push(shipmentId);
    });

    it('TC-SHIP-12: Nhận 30/50 → kho đích +30, tạo shipment_issue DAMAGED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${shipmentId}/receive`)
        .set('Authorization', `Bearer ${distToken}`)
        .send({ quantityReceived: 30, damageReason: 'Hàng bị vỡ khi vận chuyển' })
        .expect(200);

      expect(res.body.status).toBe('RECEIVED');
      expect(await getInventory(batchId, distNodeId)).toBe(30);

      // Phải tạo shipment_issue DAMAGED
      const issues = await db.query(
        `SELECT issue_type, notes FROM shipment_issues WHERE shipment_id = $1`,
        [shipmentId],
      );
      expect(issues.length).toBeGreaterThanOrEqual(1);
      const damagedIssue = issues.find((i: any) => i.issue_type === 'DAMAGED');
      expect(damagedIssue).toBeDefined();
    });

    it('TC-SHIP-13: quantityReceived > quantityShipped → 400', async () => {
      const b = await createBatch(60);
      const resShip = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId: b, destinationNodeId: distNodeId, quantityShipped: 30 })
        .expect(201);
      createdShipmentIds.push(resShip.body.id);

      await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${resShip.body.id}/receive`)
        .set('Authorization', `Bearer ${distToken}`)
        .send({ quantityReceived: 99 })
        .expect(400);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. LUÂN CHUYỂN NHIỀU CHẶNG: MFR → DIST → RETAILER
  // ═══════════════════════════════════════════════════════════════════════════
  describe('5. Luân chuyển nhiều chặng (MFR 100 → Dist 30 → Retailer 10)', () => {
    let batchId: string;

    it('TC-SHIP-14: Toàn bộ luồng 2 chặng — số tồn kho chính xác từng bước', async () => {
      // ── Bước 1: Tạo batch 100 sp tại Manufacturer ──
      batchId = await createBatch(100);
      expect(await getInventory(batchId, mfrNodeId)).toBe(100);

      // ── Bước 2: Mfr → Dist 30 sp ──
      const resShip1 = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId, destinationNodeId: distNodeId, quantityShipped: 30 })
        .expect(201);
      createdShipmentIds.push(resShip1.body.id);

      // Sau khi tạo shipment: Mfr=70, Dist=null (hàng đang IN_TRANSIT)
      expect(await getInventory(batchId, mfrNodeId)).toBe(70);
      expect(await getInventory(batchId, distNodeId)).toBeNull();

      // ── Bước 3: Dist xác nhận nhận 30 sp ──
      await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${resShip1.body.id}/receive`)
        .set('Authorization', `Bearer ${distToken}`)
        .expect(200);

      // Sau nhận: Mfr=70, Dist=30
      expect(await getInventory(batchId, mfrNodeId)).toBe(70);
      expect(await getInventory(batchId, distNodeId)).toBe(30);

      // ── Bước 4: Dist → Retailer 10 sp ──
      const resShip2 = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${distToken}`)
        .send({ batchId, destinationNodeId: retNodeId, quantityShipped: 10 })
        .expect(201);
      createdShipmentIds.push(resShip2.body.id);

      // Sau khi tạo shipment 2: Dist=20, Retailer=null
      expect(await getInventory(batchId, distNodeId)).toBe(20);
      expect(await getInventory(batchId, retNodeId)).toBeNull();

      // ── Bước 5: Retailer xác nhận nhận 10 sp ──
      await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${resShip2.body.id}/receive`)
        .set('Authorization', `Bearer ${retToken}`)
        .expect(200);

      // Kết quả cuối: Mfr=70, Dist=20, Retailer=10
      expect(await getInventory(batchId, mfrNodeId)).toBe(70);
      expect(await getInventory(batchId, distNodeId)).toBe(20);
      expect(await getInventory(batchId, retNodeId)).toBe(10);
    });

    it('TC-SHIP-15: UPSERT tồn kho — Dist nhận từ 2 shipment khác nhau → cộng dồn', async () => {
      const b = await createBatch(100);

      // Shipment 1: Mfr → Dist 20 sp
      const s1 = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId: b, destinationNodeId: distNodeId, quantityShipped: 20 })
        .expect(201);
      createdShipmentIds.push(s1.body.id);

      await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${s1.body.id}/receive`)
        .set('Authorization', `Bearer ${distToken}`)
        .expect(200);
      expect(await getInventory(b, distNodeId)).toBe(20);

      // Shipment 2: Mfr → Dist 15 sp nữa → UPSERT phải cộng dồn
      const s2 = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId: b, destinationNodeId: distNodeId, quantityShipped: 15 })
        .expect(201);
      createdShipmentIds.push(s2.body.id);

      await request(app.getHttpServer())
        .patch(`/api/v1/shipments/${s2.body.id}/receive`)
        .set('Authorization', `Bearer ${distToken}`)
        .expect(200);

      // Dist: 20 + 15 = 35
      expect(await getInventory(b, distNodeId)).toBe(35);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. PHÂN QUYỀN XEM VẬN ĐƠN
  // ═══════════════════════════════════════════════════════════════════════════
  describe('6. Phân quyền GET /api/v1/shipments/:id', () => {
    let shipmentId: string;
    let batchId: string;

    beforeAll(async () => {
      batchId = await createBatch(50);
      const res = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({ batchId, destinationNodeId: distNodeId, quantityShipped: 20 })
        .expect(201);
      shipmentId = res.body.id;
      createdShipmentIds.push(shipmentId);
    });

    it('TC-SHIP-16: Admin xem được mọi vận đơn', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/shipments/${shipmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('TC-SHIP-17: Manufacturer (kho nguồn) xem được', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/shipments/${shipmentId}`)
        .set('Authorization', `Bearer ${mfrToken}`)
        .expect(200);
    });

    it('TC-SHIP-18: Distributor (kho đích) xem được', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/shipments/${shipmentId}`)
        .set('Authorization', `Bearer ${distToken}`)
        .expect(200);
    });

    it('TC-SHIP-19: Retailer (không liên quan) → 403', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/shipments/${shipmentId}`)
        .set('Authorization', `Bearer ${retToken}`)
        .expect(403);
    });
  });
});
