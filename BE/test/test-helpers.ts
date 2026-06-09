import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { DataSource } from 'typeorm';

export async function bootstrapTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();
  return app;
}

export async function getLoginToken(
  app: INestApplication,
  email: string,
  password = 'password123',
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);
  return res.body.accessToken;
}

export async function cleanupCreatedEntities(
  app: INestApplication,
  entities: {
    scanLogIds?: string[];
    inventoryAdjustmentIds?: string[];
    timelineEventIds?: string[];
    shipmentIssueIds?: string[];
    incidentReportIds?: string[];
    shipmentIds?: string[];
    inventoryIds?: { batchId: string; nodeId: string }[];
    batchIds?: string[];
    productIds?: string[];
    userIds?: string[];
    nodeIds?: string[];
  },
): Promise<void> {
  const dataSource = app.get(DataSource);
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    if (entities.scanLogIds?.length) {
      await queryRunner.query(
        `DELETE FROM scan_logs WHERE id = ANY($1)`,
        [entities.scanLogIds],
      );
    }
    if (entities.inventoryAdjustmentIds?.length) {
      await queryRunner.query(
        `DELETE FROM inventory_adjustments WHERE id = ANY($1)`,
        [entities.inventoryAdjustmentIds],
      );
    }
    if (entities.timelineEventIds?.length) {
      await queryRunner.query(
        `DELETE FROM timeline_events WHERE id = ANY($1)`,
        [entities.timelineEventIds],
      );
    }
    if (entities.shipmentIssueIds?.length) {
      await queryRunner.query(
        `DELETE FROM shipment_issues WHERE id = ANY($1)`,
        [entities.shipmentIssueIds],
      );
    }
    if (entities.incidentReportIds?.length) {
      await queryRunner.query(
        `DELETE FROM incident_reports WHERE id = ANY($1)`,
        [entities.incidentReportIds],
      );
    }
    if (entities.shipmentIds?.length) {
      await queryRunner.query(
        `DELETE FROM shipments WHERE id = ANY($1)`,
        [entities.shipmentIds],
      );
    }
    if (entities.inventoryIds?.length) {
      for (const inv of entities.inventoryIds) {
        await queryRunner.query(
          `DELETE FROM inventory WHERE batch_id = $1 AND node_id = $2`,
          [inv.batchId, inv.nodeId],
        );
      }
    }
    if (entities.batchIds?.length) {
      // Delete QR codes first
      await queryRunner.query(
        `DELETE FROM batch_qr_codes WHERE batch_id = ANY($1)`,
        [entities.batchIds],
      );
      await queryRunner.query(
        `DELETE FROM batches WHERE id = ANY($1)`,
        [entities.batchIds],
      );
    }
    if (entities.productIds?.length) {
      await queryRunner.query(
        `DELETE FROM products WHERE id = ANY($1)`,
        [entities.productIds],
      );
    }
    if (entities.userIds?.length) {
      await queryRunner.query(
        `DELETE FROM user_roles WHERE user_id = ANY($1)`,
        [entities.userIds],
      );
      await queryRunner.query(
        `DELETE FROM users WHERE id = ANY($1)`,
        [entities.userIds],
      );
    }
    if (entities.nodeIds?.length) {
      await queryRunner.query(
        `DELETE FROM nodes WHERE id = ANY($1)`,
        [entities.nodeIds],
      );
    }
    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Cleanup failed:', error);
  } finally {
    await queryRunner.release();
  }
}
