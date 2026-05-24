import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { of } from 'rxjs';
import { AuditService } from './audit.service';
import { PublicTraceController } from './public-trace.controller';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import { BatchEntity } from '../batches/entities/batch.entity';
import { TimelineEventEntity } from '../batches/entities/timeline-event.entity';

describe('Audit & Trace Module', () => {
  let service: AuditService;
  let controller: PublicTraceController;
  let interceptor: AuditLogInterceptor;

  const mockManager = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn().mockImplementation((entityClass, data) => {
      const obj = data || entityClass;
      if (!obj.id) obj.id = 'mock-id';
      return Promise.resolve(obj);
    }),
  };

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn().mockImplementation((data) => {
      if (!data.id) data.id = 'mock-id';
      return Promise.resolve(data);
    }),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicTraceController],
      providers: [
        AuditService,
        AuditLogInterceptor,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    controller = module.get<PublicTraceController>(PublicTraceController);
    interceptor = module.get<AuditLogInterceptor>(AuditLogInterceptor);
  });

  describe('PublicTraceController', () => {
    it('should throw NotFoundException if batch code is not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        user: null,
      };

      await expect(
        controller.getTrace('BCH-MISSING', req, undefined, undefined),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return batch and timeline events, and call recordScanLogAsync asynchronously', async () => {
      const batch = new BatchEntity();
      batch.id = 'batch-uuid';
      batch.batchCode = 'BCH-VALID';

      const event = new TimelineEventEntity();
      event.id = 'event-uuid';

      mockRepository.findOne.mockResolvedValueOnce(batch);
      mockRepository.find.mockResolvedValueOnce([event]);

      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        user: { userId: 'scanner-uuid' },
      };

      const recordScanLogSpy = jest
        .spyOn(service, 'recordScanLogAsync')
        .mockResolvedValueOnce();

      const result = await controller.getTrace('BCH-VALID', req, '10.5', '106.5');

      expect(result).toBeDefined();
      expect(result.batch.batchCode).toBe('BCH-VALID');
      expect(result.timelineEvents).toEqual([
        {
          eventType: undefined,
          notes: undefined,
          occurredAt: undefined,
          node: null,
          actor: null,
        },
      ]);
      expect(recordScanLogSpy).toHaveBeenCalledWith({
        batchId: 'batch-uuid',
        scannedBy: 'scanner-uuid',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        latitude: 10.5,
        longitude: 106.5,
      });
    });
  });

  describe('AuditLogInterceptor', () => {
    it('should skip logging if not a mutating method', async () => {
      const req = {
        method: 'GET',
        url: '/api/v1/products',
        user: { userId: 'user-uuid' },
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => req,
        }),
      } as any;

      const next = {
        handle: () => of({ data: 'ok' }),
      };

      const result$ = await interceptor.intercept(context, next);
      const result = await result$.toPromise();

      expect(result).toEqual({ data: 'ok' });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should skip logging if user is not authenticated', async () => {
      const req = {
        method: 'POST',
        url: '/api/v1/products',
        user: null,
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => req,
        }),
      } as any;

      const next = {
        handle: () => of({ data: 'ok' }),
      };

      const result$ = await interceptor.intercept(context, next);
      const result = await result$.toPromise();

      expect(result).toEqual({ data: 'ok' });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should save audit log for POST mutating requests', async () => {
      const req = {
        method: 'POST',
        url: '/api/v1/products',
        headers: {
          'user-agent': 'agent-test',
        },
        ip: '127.0.0.1',
        user: { userId: 'user-uuid' },
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => req,
        }),
      } as any;

      const responseObj = { id: 'prod-uuid', name: 'Product X' };
      const next = {
        handle: () => of(responseObj),
      };

      const result$ = await interceptor.intercept(context, next);
      const result = await result$.toPromise();

      expect(result).toEqual(responseObj);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
