import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentReportEntity } from './entities/incident-report.entity';
import { ShipmentEntity } from '../shipments/entities/shipment.entity';
import { BatchEntity } from '../batches/entities/batch.entity';
import { InventoryEntity } from '../batches/entities/inventory.entity';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';
import { BatchStatus } from '../../common/enums/batch-status.enum';

describe('IncidentsService', () => {
  let service: IncidentsService;

  const mockManager = {
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((entityClass, data) => {
      const obj = data || entityClass;
      if (!obj.id) obj.id = 'mock-id';
      return Promise.resolve(obj);
    }),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue(undefined),
    manager: mockManager,
  };

  const mockRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<IncidentsService>(IncidentsService);
  });

  describe('createIncident', () => {
    it('should throw NotFoundException if shipment is not found', async () => {
      const dto: CreateIncidentDto = {
        shipmentId: 'shipment-uuid',
        incidentType: 'MISSING',
        description: 'Mô tả sự cố thất lạc hàng hoá cần điều tra',
      };
      const user = { userId: 'admin-1-uuid' };

      mockManager.findOne.mockResolvedValueOnce(null); // Shipment not found

      await expect(service.createIncident(dto, user)).rejects.toThrow(
        new NotFoundException('Không tìm thấy vận đơn với ID shipment-uuid'),
      );
    });

    it('should create incident, freeze batch and log timeline event successfully', async () => {
      const dto: CreateIncidentDto = {
        shipmentId: 'shipment-uuid',
        incidentType: 'MISSING',
        description: 'Mô tả sự cố thất lạc hàng hoá cần điều tra',
      };
      const user = { userId: 'admin-1-uuid' };

      const shipment = new ShipmentEntity();
      shipment.id = 'shipment-uuid';
      shipment.batchId = 'batch-uuid';
      shipment.sourceNodeId = 'node-source-uuid';

      const batch = new BatchEntity();
      batch.id = 'batch-uuid';
      batch.status = BatchStatus.IN_TRANSIT;

      mockManager.findOne
        .mockResolvedValueOnce(shipment) // Shipment found
        .mockResolvedValueOnce(batch); // Batch found

      const result = await service.createIncident(dto, user);

      expect(result).toBeDefined();
      expect(result.incidentCode).toContain('INC-');
      expect(result.status).toBe('OPEN');
      expect(batch.status).toBe(BatchStatus.INVESTIGATING);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('confirmLost', () => {
    it('should throw NotFoundException if incident report is not found', async () => {
      mockManager.findOne.mockResolvedValueOnce(null);

      await expect(service.confirmLost('incident-id', { userId: 'admin-2-uuid' })).rejects.toThrow(
        new NotFoundException('Không tìm thấy hồ sơ sự cố với ID incident-id'),
      );
    });

    it('should throw BadRequestException if incident report status is not OPEN', async () => {
      const incident = new IncidentReportEntity();
      incident.id = 'incident-id';
      incident.status = 'CLOSED';

      mockManager.findOne.mockResolvedValueOnce(incident);

      await expect(service.confirmLost('incident-id', { userId: 'admin-2-uuid' })).rejects.toThrow(
        new BadRequestException('Sự cố này đã được giải quyết hoặc đóng.'),
      );
    });

    it('should throw ForbiddenException if approver is the same as reporter (Two-Man Rule)', async () => {
      const incident = new IncidentReportEntity();
      incident.id = 'incident-id';
      incident.status = 'OPEN';
      incident.reportedBy = 'admin-1-uuid';

      mockManager.findOne.mockResolvedValueOnce(incident);

      await expect(service.confirmLost('incident-id', { userId: 'admin-1-uuid' })).rejects.toThrow(
        new ForbiddenException(
          'Quy tắc phê duyệt kép: Người phê duyệt lần 2 không được trùng với người báo cáo sự cố lần 1',
        ),
      );
    });

    it('should rollback inventory, change status to LOST, audit adjustment, and close incident successfully', async () => {
      const incident = new IncidentReportEntity();
      incident.id = 'incident-id';
      incident.status = 'OPEN';
      incident.reportedBy = 'admin-1-uuid';
      incident.shipmentId = 'shipment-uuid';

      const shipment = new ShipmentEntity();
      shipment.id = 'shipment-uuid';
      shipment.batchId = 'batch-uuid';
      shipment.sourceNodeId = 'node-source-uuid';
      shipment.quantityShipped = 100;
      shipment.trackingCode = 'SHP-001';

      const batch = new BatchEntity();
      batch.id = 'batch-uuid';
      batch.status = BatchStatus.INVESTIGATING;

      const inventory = new InventoryEntity();
      inventory.batchId = 'batch-uuid';
      inventory.nodeId = 'node-source-uuid';
      inventory.quantityAvailable = 50;

      mockManager.findOne
        .mockResolvedValueOnce(incident) // incident
        .mockResolvedValueOnce(shipment) // shipment
        .mockResolvedValueOnce(batch); // batch

      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(inventory),
      };
      mockManager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.confirmLost('incident-id', { userId: 'admin-2-uuid' });

      expect(result.status).toBe('CLOSED');
      expect(result.resolutionType).toBe('LOSS_CONFIRMED');
      expect(inventory.quantityAvailable).toBe(150); // 50 + 100
      expect(shipment.status).toBe(ShipmentStatus.LOST);
      expect(batch.status).toBe(BatchStatus.LOST);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('handleOverdueShipments', () => {
    it('should record OVERDUE warning issues and mark batches as DELAYED', async () => {
      const shipment = new ShipmentEntity();
      shipment.id = 'shipment-uuid';
      shipment.batchId = 'batch-uuid';
      shipment.status = ShipmentStatus.IN_TRANSIT;
      shipment.shippedAt = new Date(Date.now() - 50 * 60 * 60 * 1000); // 50 hours ago (> 48h)
      shipment.trackingCode = 'SHP-OVERDUE';

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([shipment]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepository.findOne.mockResolvedValue(null); // No existing warning

      const batch = new BatchEntity();
      batch.id = 'batch-uuid';
      batch.status = BatchStatus.IN_TRANSIT;

      mockManager.findOne.mockResolvedValue(batch);

      await service.handleOverdueShipments();

      expect(batch.status).toBe(BatchStatus.DELAYED);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated list of incidents', async () => {
      const incidents = [{ id: 'inc-1' }];
      mockRepository.findAndCount.mockResolvedValue([incidents, 1]);

      const result = await service.findAll({ page: '1', limit: '10' });

      expect(result.data).toEqual(incidents);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('confirmFound', () => {
    it('should throw NotFoundException if incident is not found', async () => {
      mockManager.findOne.mockResolvedValueOnce(null);

      await expect(service.confirmFound('inc-id', { userId: 'admin-1' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if incident is not OPEN', async () => {
      const incident = { id: 'inc-id', status: 'CLOSED' };
      mockManager.findOne.mockResolvedValueOnce(incident);

      await expect(service.confirmFound('inc-id', { userId: 'admin-1' })).rejects.toThrow(BadRequestException);
    });

    it('should successfully close incident, update shipment/batch status and insert/upsert inventory', async () => {
      const incident = { id: 'inc-id', status: 'OPEN', shipmentId: 'ship-id' };
      const shipment = {
        id: 'ship-id',
        batchId: 'batch-id',
        destinationNodeId: 'node-dest-id',
        quantityShipped: 50,
        trackingCode: 'SHP-FOUND',
        status: ShipmentStatus.IN_TRANSIT,
      };
      const batch = { id: 'batch-id', status: BatchStatus.INVESTIGATING, currentNodeId: 'node-src-id' };

      mockManager.findOne
        .mockResolvedValueOnce(incident) // incident
        .mockResolvedValueOnce(shipment) // shipment
        .mockResolvedValueOnce(batch); // batch

      const result = await service.confirmFound('inc-id', { userId: 'admin-1' });

      expect(result.status).toBe('CLOSED');
      expect(result.resolutionType).toBe('FOUND_CONFIRMED');
      expect(shipment.status).toBe(ShipmentStatus.RECEIVED);
      expect(batch.status).toBe(BatchStatus.RECEIVED);
      expect(batch.currentNodeId).toBe('node-dest-id');
      expect(mockQueryRunner.query).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });
});
