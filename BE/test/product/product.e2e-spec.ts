import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, getLoginToken, cleanupCreatedEntities } from '../test-helpers';

describe('ProductModule (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let mfrToken: string;
  const createdProductIds: string[] = [];

  beforeAll(async () => {
    app = await bootstrapTestApp();
    adminToken = await getLoginToken(app, 'admin@logistic.com');
    mfrToken = await getLoginToken(app, 'mfr_a@logistic.com');
  });

  afterAll(async () => {
    await cleanupCreatedEntities(app, { productIds: createdProductIds });
    await app.close();
  });

  describe('POST /api/v1/products', () => {
    it('should allow Admin to create a product', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Sản phẩm Test E2E',
          sku: 'SKU-E2E-TEST',
          unit: 'Hộp',
          unitPrice: 150000,
          description: 'Mô tả test',
          category: 'Vật liệu',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Sản phẩm Test E2E');
      createdProductIds.push(res.body.id);
    });

    it('should forbid Manufacturer from creating a product', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          name: 'Sản phẩm Test E2E Mfr',
          sku: 'SKU-E2E-MFR',
          unit: 'Hộp',
          unitPrice: 100000,
        })
        .expect(403);
    });
  });

  describe('GET /api/v1/products', () => {
    it('should retrieve list of products', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${mfrToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should retrieve product details by ID', async () => {
      const productId = createdProductIds[0];
      const res = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${mfrToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', productId);
      expect(res.body.name).toBe('Sản phẩm Test E2E');
    });

    it('should return 400 for invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products/invalid-uuid')
        .set('Authorization', `Bearer ${mfrToken}`)
        .expect(400);
    });

    it('should return 404 for non-existent product UUID', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/products/99999999-9999-4999-a999-999999999999')
        .set('Authorization', `Bearer ${mfrToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should allow Admin to update a product', async () => {
      const productId = createdProductIds[0];
      const res = await request(app.getHttpServer())
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Sản phẩm Test E2E Sửa Tên',
          unitPrice: 180000,
        })
        .expect(200);

      expect(res.body.name).toBe('Sản phẩm Test E2E Sửa Tên');
      expect(res.body.unitPrice).toBe(180000);
    });

    it('should forbid Manufacturer from updating a product', async () => {
      const productId = createdProductIds[0];
      await request(app.getHttpServer())
        .put(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${mfrToken}`)
        .send({
          name: 'Sản phẩm Mfr hack',
        })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should allow Admin to delete a product', async () => {
      const productId = createdProductIds[0];
      await request(app.getHttpServer())
        .delete(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify the product is now marked as inactive
      const res = await request(app.getHttpServer())
        .get(`/api/v1/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.isActive).toBe(false);
    });
  });
});
