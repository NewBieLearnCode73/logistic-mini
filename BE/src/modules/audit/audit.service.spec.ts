import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { of } from 'rxjs';
import { AuditService } from './audit.service';
import { PublicTraceController } from './public-trace.controller';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import { BatchEntity } from '../batches/entities/batch.entity';
import { TimelineEventEntity } from '../batches/entities/timeline-event.entity';
import { JwtService } from '@nestjs/jwt';

describe('Audit & Trace Module', () => {
  let service: AuditService;
  let controller: PublicTraceController;
  let interceptor: AuditLogInterceptor;
  let jwtService: JwtService;

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

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicTraceController],
      providers: [
        AuditService,
        AuditLogInterceptor,
        { provide: DataSource, useValue: mockDataSource },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    controller = module.get<PublicTraceController>(PublicTraceController);
    interceptor = module.get<AuditLogInterceptor>(AuditLogInterceptor);
    jwtService = module.get<JwtService>(JwtService);
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

  describe('AuditService', () => {
    it('should return complete timeline for Admin', async () => {
      const events = [
        { id: '1', eventType: 'CREATED', occurredAt: new Date('2026-06-01') },
        { id: '2', eventType: 'SHIPPED', shipmentId: 'ship-1', occurredAt: new Date('2026-06-02') },
        { id: '3', eventType: 'RECEIVED', shipmentId: 'ship-1', occurredAt: new Date('2026-06-03') },
      ];

      const spyRepo = jest.spyOn(mockDataSource, 'getRepository').mockImplementation((entity: any) => {
        if (entity.name === 'TimelineEventEntity') {
          return { find: jest.fn().mockResolvedValue(events) } as any;
        }
        return {} as any;
      });

      const user = { userId: 'admin-uuid', role: 'Admin' };
      const result = await service.getBatchTimeline('batch-uuid', user);

      expect(result.length).toBe(3);
      spyRepo.mockRestore();
    });

    it('should filter timeline for Manufacturer up to first received event', async () => {
      const events = [
        { id: '1', eventType: 'CREATED', nodeId: 'mfr-node-uuid', occurredAt: new Date('2026-06-01') },
        { id: '2', eventType: 'SHIPPED', shipmentId: 'ship-1', nodeId: 'mfr-node-uuid', occurredAt: new Date('2026-06-02') },
        { id: '3', eventType: 'RECEIVED', shipmentId: 'ship-1', nodeId: 'dist-a-node-uuid', occurredAt: new Date('2026-06-03') },
        { id: '4', eventType: 'SHIPPED', shipmentId: 'ship-2', nodeId: 'dist-a-node-uuid', occurredAt: new Date('2026-06-04') },
        { id: '5', eventType: 'RECEIVED', shipmentId: 'ship-2', nodeId: 'dist-b-node-uuid', occurredAt: new Date('2026-06-05') },
      ];

      const spyRepo = jest.spyOn(mockDataSource, 'getRepository').mockImplementation((entity: any) => {
        if (entity.name === 'TimelineEventEntity') {
          return { find: jest.fn().mockResolvedValue(events) } as any;
        }
        if (entity.name === 'ShipmentEntity') {
          return {
            find: jest.fn().mockResolvedValue([{ id: 'ship-1', sourceNodeId: 'mfr-node-uuid' }]),
          } as any;
        }
        return {} as any;
      });

      const user = { userId: 'mfr-uuid', role: 'Manufacturer', nodeId: 'mfr-node-uuid' };
      const result = await service.getBatchTimeline('batch-uuid', user);

      expect(result.length).toBe(5);
      expect(result[result.length - 1].eventType).toBe('RECEIVED');
      expect(result[result.length - 1].shipmentId).toBe('ship-2');
      spyRepo.mockRestore();
    });
  });
});
