import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, getLoginToken, cleanupCreatedEntities } from '../test-helpers';
import { DataSource } from 'typeorm';
import { IncidentsService } from '../../src/modules/incidents/incidents.service';

describe('IncidentModule (e2e)', () => {
  let app: INestApplication;
  let admin1Token: string;
  let admin2Token: string;
  let mfrToken: string;
  let db: DataSource;
  let incidentsService: IncidentsService;

  const createdBatchIds: string[] = [];
  const createdProductIds: string[] = [];
  const createdShipmentIds: string[] = [];
  let testProductId: string;

  const mfrNodeId = '550e8400-e29b-41d4-a716-446655440001';
  const distNodeId = '550e8400-e29b-41d4-a716-446655440003';

  // Admin 1 (Hệ Thống Admin): 990e8400-e29b-41d4-a716-446655440001
  // Admin 2 (Admin 2): 5a3e9b3b-5a9d-4a9f-8fd4-b99a459f6b75

  beforeAll(async () => {
    app = await bootstrapTestApp();
    db = app.get(DataSource);
    incidentsService = app.get(IncidentsService);

    admin1Token = await getLoginToken(app, 'admin@logistic.com');
    admin2Token = await getLoginToken(app, 'admin2@logistic.com');
    mfrToken = await getLoginToken(app, 'mfr_a@logistic.com');

    // Create a product
    const resProd = await request(app.getHttpServer())
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${admin1Token}`)
      .send({
        name: 'Sản phẩm Test Incident',
        sku: 'SKU-INCIDENT-TEST',
        unit: 'Hộp',
        unitPrice: 200,
      })
      .expect(201);

    testProductId = resProd.body.id;
    createdProductIds.push(testProductId);
  });

  afterAll(async () => {
    // Delete any created inventory, timeline, adjustments, issues, reports, and shipments
    const batchList = [...createdBatchIds];
    const shipmentList = [...createdShipmentIds];

    if (shipmentList.length) {
      await db.query(`DELETE FROM scan_logs WHERE batch_id = ANY($1)`, [batchList]);
      await db.query(`DELETE FROM inventory_adjustments WHERE batch_id = ANY($1)`, [batchList]);
      await db.query(`DELETE FROM timeline_events WHERE batch_id = ANY($1)`, [batchList]);
      await db.query(`DELETE FROM shipment_issues WHERE shipment_id = ANY($1)`, [shipmentList]);
      await db.query(`DELETE FROM incident_reports WHERE shipment_id = ANY($1)`, [shipmentList]);
      await db.query(`DELETE FROM shipments WHERE id = ANY($1)`, [shipmentList]);
    }
    if (batchList.length) {
      await db.query(`DELETE FROM inventory WHERE batch_id = ANY($1)`, [batchList]);
      await db.query(`DELETE FROM batch_qr_codes WHERE batch_id = ANY($1)`, [batchList]);
      await db.query(`DELETE FROM batches WHERE id = ANY($1)`, [batchList]);
    }
    await cleanupCreatedEntities(app, {
      productIds: createdProductIds,
    });
    await app.close();
  });

  describe('TC-EX-04 - Overdue Shipment Auto-Detection', () => {
    let shipmentId: string;
    let batchId: string;

    beforeAll(async () => {
      // 1. Create a batch
      const resBatch = await request(app.getHttpServer())
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          productId: testProductId,
          quantity: 500,
          manufactureDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        })
        .expect(201);

      batchId = resBatch.body.id;
      createdBatchIds.push(batchId);

      // 2. Create a shipment
      const resShip = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          batchId,
          destinationNodeId: distNodeId,
          quantityShipped: 300,
        })
        .expect(201);

      shipmentId = resShip.body.id;
      createdShipmentIds.push(shipmentId);

      // 3. Manually push shipped_at to 50 hours ago
      await db.query(
        `UPDATE shipments SET shipped_at = NOW() - INTERVAL '50 hours', created_at = NOW() - INTERVAL '50 hours' WHERE id = $1`,
        [shipmentId],
      );
    });

    it('should automatically flag overdue shipment, create incidents, and update statuses', async () => {
      // Trigger the Cron handler manually
      await incidentsService.handleOverdueShipments();

      // Verify Shipment status updated to DELAYED
      const shipment = await db.query(`SELECT status FROM shipments WHERE id = $1`, [shipmentId]);
      expect(shipment[0].status).toBe('DELAYED');

      // Verify Batch status updated to DELAYED
      const batch = await db.query(`SELECT status FROM batches WHERE id = $1`, [batchId]);
      expect(batch[0].status).toBe('DELAYED');

      // Verify ShipmentIssue created
      const issue = await db.query(`SELECT * FROM shipment_issues WHERE shipment_id = $1`, [shipmentId]);
      expect(issue.length).toBe(1);
      expect(issue[0].issue_type).toBe('OVERDUE');

      // Verify IncidentReport created
      const incident = await db.query(`SELECT * FROM incident_reports WHERE shipment_id = $1`, [shipmentId]);
      expect(incident.length).toBe(1);
      expect(incident[0].incident_type).toBe('DELAYED_SHIPMENT');
      expect(incident[0].status).toBe('OPEN');

      // Verify TimelineEvent created with type DELAYED
      const events = await db.query(
        `SELECT event_type FROM timeline_events WHERE batch_id = $1 AND event_type = 'DELAYED'`,
        [batchId],
      );
      expect(events.length).toBe(1);
    });
  });

  describe('TC-EX-05 - Confirm LOST and Two-Man Approval', () => {
    let shipmentId: string;
    let batchId: string;
    let incidentId: string;

    beforeAll(async () => {
      // 1. Create batch
      const resBatch = await request(app.getHttpServer())
        .post('/api/v1/batches')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          productId: testProductId,
          quantity: 400,
          manufactureDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        })
        .expect(201);

      batchId = resBatch.body.id;
      createdBatchIds.push(batchId);

      // 2. Create shipment
      const resShip = await request(app.getHttpServer())
        .post('/api/v1/shipments')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          batchId,
          destinationNodeId: distNodeId,
          quantityShipped: 300,
        })
        .expect(201);

      shipmentId = resShip.body.id;
      createdShipmentIds.push(shipmentId);

      // 3. Admin 1 reports / opens manual incident on it
      const resIncident = await request(app.getHttpServer())
        .post('/api/v1/incidents')
        .set('Authorization', `Bearer ${admin1Token}`)
        .send({
          shipmentId,
          incidentType: 'MISSING',
          description: 'Vaccine missing in transit',
          priority: 'HIGH',
        })
        .expect(201);

      incidentId = resIncident.body.id;
    });

    it('should allow first approval (Admin 1) to mark batch as LOST (waiting for final double-approval)', async () => {
      // Call confirm-lost by Admin 1
      const res = await request(app.getHttpServer())
        .post(`/api/v1/incidents/${incidentId}/confirm-lost`)
        .set('Authorization', `Bearer ${admin1Token}`)
        .expect(200);

      expect(res.body.firstApprovedBy).toBe('990e8400-e29b-41d4-a716-446655440001');

      // Verify batch status is now LOST
      const batch = await db.query(`SELECT status FROM batches WHERE id = $1`, [batchId]);
      expect(batch[0].status).toBe('LOST');
    });

    it('should throw 403 Forbidden if the same Admin 1 tries to approve the second time', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/incidents/${incidentId}/confirm-lost`)
        .set('Authorization', `Bearer ${admin1Token}`)
        .expect(403);

      expect(res.body.message).toContain('Quy tắc phê duyệt kép: Người xác nhận thứ hai phải khác người đề xuất/xác nhận thứ nhất');
    });

    it('should complete transition to LOST shipment and restore stock to source node when Admin 2 approves', async () => {
      // Call confirm-lost by Admin 2
      const res = await request(app.getHttpServer())
        .post(`/api/v1/incidents/${incidentId}/confirm-lost`)
        .set('Authorization', `Bearer ${admin2Token}`)
        .expect(200);

      expect(res.body.status).toBe('CLOSED');
      expect(res.body.approvedBy).toBe('5a3e9b3b-5a9d-4a9f-8fd4-b99a459f6b75');
      expect(res.body.resolutionType).toBe('LOSS_CONFIRMED');

      // Verify Shipment status is LOST
      const shipment = await db.query(`SELECT status FROM shipments WHERE id = $1`, [shipmentId]);
      expect(shipment[0].status).toBe('LOST');

      // Verify Batch status is reset to CREATED and currentNodeId is reset to source node
      const batch = await db.query(`SELECT status, current_node_id FROM batches WHERE id = $1`, [batchId]);
      expect(batch[0].status).toBe('CREATED');
      expect(batch[0].current_node_id).toBe(mfrNodeId);

      // Verify source node inventory restored: 100 + 300 = 400
      const invSource = await db.query(
        `SELECT quantity_available FROM inventory WHERE batch_id = $1 AND node_id = $2`,
        [batchId, mfrNodeId],
      );
      expect(Number(invSource[0].quantity_available)).toBe(400);

      // Verify inventory adjustment LOSS_ROLLBACK recorded
      const adj = await db.query(
        `SELECT adjustment_type, qty_before, qty_delta, qty_after FROM inventory_adjustments WHERE reference_id = $1`,
        [incidentId],
      );
      expect(adj.length).toBe(1);
      expect(adj[0].adjustment_type).toBe('LOSS_ROLLBACK');
      expect(Number(adj[0].qty_before)).toBe(100);
      expect(Number(adj[0].qty_delta)).toBe(300);
      expect(Number(adj[0].qty_after)).toBe(400);
    });
  });
});
