import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { DashboardSystemService } from './dashboard-system.service';
import { RoleName } from '../../common/enums/role.enum';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';
import { BadRequestException } from '@nestjs/common';

describe('DashboardSystemService', () => {
  let service: DashboardSystemService;

  const mockRepository = {
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(),
    getMany: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardSystemService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<DashboardSystemService>(DashboardSystemService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should aggregate total stats for Admin role', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: 5000 }),
        getCount: jest.fn().mockResolvedValue(10),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const user = { role: RoleName.ADMIN };
      const stats = await service.getStats(user);

      expect(stats.totalInventory).toBe(5000);
      expect(stats.activeShipments).toBe(10);
      expect(stats.incidents).toBe(10);
    });

    it('should filter stats by nodeId for non-Admin role', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ sum: 1200 }),
        getCount: jest.fn().mockResolvedValue(4),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const user = { role: RoleName.DISTRIBUTOR, nodeId: 'node-A-uuid' };
      const stats = await service.getStats(user);

      expect(stats.totalInventory).toBe(1200);
      expect(stats.activeShipments).toBe(4);
      expect(stats.incidents).toBe(4);
    });
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs', async () => {
      const mockLogs = [{ id: 'log-1', action: 'CREATE' }];
      mockRepository.findAndCount.mockResolvedValueOnce([mockLogs, 1]);

      const result = await service.getAuditLogs({ page: '1', limit: '5' });

      expect(result.data).toEqual(mockLogs);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(5);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('exportReport', () => {
    it('should return csv format for inventory', async () => {
      const mockInventory = [
        {
          batchId: 'batch-1',
          quantityAvailable: 100,
          batch: { batchCode: 'BCH-1', product: { name: 'Prod-A' } },
          node: { name: 'Node-1' },
          lastUpdatedAt: new Date('2026-05-24T00:00:00.000Z'),
        },
      ];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInventory),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const user = { role: RoleName.ADMIN };
      const report = await service.exportReport('inventory', 'csv', 'month', user);

      expect(report.contentType).toBe('text/csv; charset=utf-8');
      expect(report.filename).toBe('report_inventory_month.csv');
      expect(report.content.toString()).toContain('BÁO CÁO CHUỖI CUNG ỨNG MINI');
    });

    it('should support custom date range with custom period', async () => {
      const mockInventory = [];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInventory),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const user = { role: RoleName.ADMIN };
      const report = await service.exportReport('inventory', 'csv', 'custom', user, '2026-06-01', '2026-06-08');

      expect(report.contentType).toBe('text/csv; charset=utf-8');
      expect(report.filename).toBe('report_inventory_2026-06-01_to_2026-06-08.csv');
    });

    it('should return pdf format for shipments', async () => {
      const mockShipments = [
        {
          trackingCode: 'SHP-1',
          quantityShipped: 50,
          status: ShipmentStatus.IN_TRANSIT,
          batch: { batchCode: 'BCH-1', product: { name: 'Prod-A' } },
          sourceNode: { name: 'Source' },
          destinationNode: { name: 'Dest' },
          shippedAt: new Date(),
        },
      ];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockShipments),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const user = { role: RoleName.ADMIN };
      const report = await service.exportReport('shipments', 'pdf', 'month', user);

      expect(report.contentType).toBe('application/pdf');
      expect(report.filename).toBe('report_shipments_month.pdf');
      expect(report.content).toBeInstanceOf(Buffer);
    });

    it('should generate empty report if no data is found', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const user = { role: RoleName.ADMIN };
      const report = await service.exportReport('shipments', 'pdf', 'month', user);
      
      expect(report.contentType).toBe('application/pdf');
      expect(report.filename).toBe('report_shipments_month.pdf');
      expect(report.content).toBeInstanceOf(Buffer);
    });
  });
});
