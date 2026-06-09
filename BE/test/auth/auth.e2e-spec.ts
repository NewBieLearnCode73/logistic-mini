import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootstrapTestApp, getLoginToken } from '../test-helpers';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await bootstrapTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@logistic.com',
          password: 'password123',
        })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('should fail with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@logistic.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nobody@logistic.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should validation fail with empty input', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should fetch logged in user info with token', async () => {
      const token = await getLoginToken(app, 'admin@logistic.com');

      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('email', 'admin@logistic.com');
      expect(res.body).toHaveProperty('fullName');
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('should return 401 Unauthorized without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should log out successfully', async () => {
      const token = await getLoginToken(app, 'admin@logistic.com');
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect({ message: 'Đăng xuất thành công' });
    });
  });
});
