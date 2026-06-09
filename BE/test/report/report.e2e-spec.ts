import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, getLoginToken } from '../test-helpers';

describe('ReportAndDashboardModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let mfrToken: string;
  let retToken: string;

  beforeAll(async () => {
    app = await bootstrapTestApp();
    adminToken = await getLoginToken(app, 'admin@logistic.com');
    mfrToken = await getLoginToken(app, 'mfr_a@logistic.com');
    retToken = await getLoginToken(app, 'ret_a@logistic.com');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/dashboard/stats', () => {
    it('should allow Admin to fetch system-wide dashboard stats', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalInventory');
      expect(res.body).toHaveProperty('activeShipments');
      expect(res.body).toHaveProperty('incidents');
    });

    it('should allow Retailer to fetch node-filtered stats', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${retToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalInventory');
    });
  });

  describe('POST /api/v1/reports/export', () => {
    it('should allow Admin to export CSV report for inventory', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/reports/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          format: 'csv',
          reportType: 'inventory',
          period: 'today',
        })
        .expect(201); // Note: NestJS POST default code is 201 Created

      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment; filename=');
    });

    it('should allow Manufacturer to export PDF report for shipments', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/reports/export')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          format: 'pdf',
          reportType: 'shipments',
          period: 'month',
        })
        .expect(201);

      expect(res.headers['content-type']).toContain('application/pdf');
    });

    it('should forbid Retailer from exporting reports', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reports/export')
        .set('Authorization', `Bearer ${retToken}`)
        .send({
          format: 'csv',
          reportType: 'incidents',
        })
        .expect(403);
    });
  });

  describe('GET /api/v1/audit-logs', () => {
    it('should allow Admin to fetch audit logs', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should forbid Manufacturer from fetching audit logs', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/audit-logs')
        .set('Authorization', `Bearer ${mfrToken}`)
        .expect(403);
    });
  });
});
