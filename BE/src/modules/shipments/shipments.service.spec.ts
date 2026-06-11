import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { BatchEntity } from '../batches/entities/batch.entity';
import { NodeEntity } from '../nodes/entities/node.entity';
import { InventoryEntity } from '../batches/entities/inventory.entity';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';
import { BatchStatus } from '../../common/enums/batch-status.enum';

describe('ShipmentsService', () => {
  let service: ShipmentsService;

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
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated shipments for Admin', async () => {
      const shipments = [{ id: 'ship-1' }];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([shipments, 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: '1', limit: '10' }, { role: 'Admin' });

      expect(result.data).toEqual(shipments);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should filter shipments by nodeId for non-Admin users', async () => {
      const shipments = [{ id: 'ship-1' }];
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([shipments, 1]),
      };
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ page: '1', limit: '5' }, { role: 'Distributor', nodeId: 'node-A' });

      expect(result.data).toEqual(shipments);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(shipment.sourceNodeId = :nodeId OR shipment.destinationNodeId = :nodeId)',
        { nodeId: 'node-A' },
      );
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if shipment is not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('ship-uuid', { role: 'Admin' })).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if non-Admin user does not belong to source or dest node', async () => {
      const shipment = { id: 'ship-uuid', sourceNodeId: 'node-A', destinationNodeId: 'node-B' };
      mockRepository.findOne.mockResolvedValueOnce(shipment);

      await expect(
        service.findOne('ship-uuid', { role: 'Distributor', nodeId: 'node-C' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully return shipment details with receiver and issues', async () => {
      const shipment = { id: 'ship-uuid', sourceNodeId: 'node-A', destinationNodeId: 'node-B' };
      const receiveEvent = { id: 'evt-1', quantityDelta: 50, actor: { fullName: 'Receiver User' } };
      const issues = [{ id: 'issue-1', issueType: 'OVERDUE' }];

      mockRepository.findOne
        .mockResolvedValueOnce(shipment) // Find shipment
        .mockResolvedValueOnce(receiveEvent); // Find receiveEvent

      mockRepository.find.mockResolvedValueOnce(issues); // Find issues

      const result = await service.findOne('ship-uuid', { role: 'Distributor', nodeId: 'node-B' });

      expect(result.id).toBe('ship-uuid');
      expect(result.quantityReceived).toBe(50);
      expect(result.receiver).toEqual({ fullName: 'Receiver User' });
      expect(result.issues).toEqual(issues);
    });
  });

  describe('createTransfer', () => {
    it('should throw BadRequestException if source node and destination node are identical', async () => {
      const dto: CreateShipmentDto = {
        batchId: 'batch-uuid',
        destinationNodeId: 'node-uuid-A',
        quantityShipped: 50,
      };
      const user = { userId: 'user-uuid', role: 'Manufacturer', nodeId: 'node-uuid-A' };

      await expect(service.createTransfer(dto, user)).rejects.toThrow(
        new BadRequestException('Kho xuất và kho nhận không được trùng nhau'),
      );
    });

    it('should throw NotFoundException if batch is not found', async () => {
      const dto: CreateShipmentDto = {
        batchId: 'batch-uuid',
        destinationNodeId: 'node-uuid-B',
        quantityShipped: 50,
      };
      const user = { userId: 'user-uuid', role: 'Manufacturer', nodeId: 'node-uuid-A' };

      mockManager.findOne.mockResolvedValueOnce(null); // Batch not found

      await expect(service.createTransfer(dto, user)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if destination node is not found', async () => {
      const dto: CreateShipmentDto = {
        batchId: 'batch-uuid',
        destinationNodeId: 'node-uuid-B',
        quantityShipped: 50,
      };
      const user = { userId: 'user-uuid', role: 'Manufacturer', nodeId: 'node-uuid-A' };

      mockManager.findOne
        .mockResolvedValueOnce(new BatchEntity()) // Batch exists
        .mockResolvedValueOnce(null); // Dest node not found or inactive

      await expect(service.createTransfer(dto, user)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if inventory does not exist at source node', async () => {
      const dto: CreateShipmentDto = {
        batchId: 'batch-uuid',
        destinationNodeId: 'node-uuid-B',
        quantityShipped: 50,
      };
      const user = { userId: 'user-uuid', role: 'Manufacturer', nodeId: 'node-uuid-A' };

      mockManager.findOne
        .mockResolvedValueOnce(new BatchEntity()) // Batch exists
        .mockResolvedValueOnce(new NodeEntity()); // Dest node exists

      // Mock query builder for setLock
      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // No inventory
      };
      mockManager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.createTransfer(dto, user)).rejects.toThrow(
        new BadRequestException('Lô hàng không tồn tại hoặc không còn hàng tại kho nguồn'),
      );
    });

    it('should throw BadRequestException if source inventory is insufficient', async () => {
      const dto: CreateShipmentDto = {
        batchId: 'batch-uuid',
        destinationNodeId: 'node-uuid-B',
        quantityShipped: 50,
      };
      const user = { userId: 'user-uuid', role: 'Manufacturer', nodeId: 'node-uuid-A' };

      const batch = new BatchEntity();
      batch.unit = 'kg';

      mockManager.findOne
        .mockResolvedValueOnce(batch) // Batch exists
        .mockResolvedValueOnce(new NodeEntity()); // Dest node exists

      const inventory = new InventoryEntity();
      inventory.quantityAvailable = 30; // Only 30 available, but need 50

      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(inventory),
      };
      mockManager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.createTransfer(dto, user)).rejects.toThrow(
        new BadRequestException('Không đủ số lượng hàng tồn kho để xuất. Hiện có: 30 kg'),
      );
    });

    it('should successfully create shipment, deduct inventory, and update status', async () => {
      const dto: CreateShipmentDto = {
        batchId: 'batch-uuid',
        destinationNodeId: 'node-uuid-B',
        quantityShipped: 50,
        notes: 'Chuyển hàng kiểm nghiệm',
      };
      const user = { userId: 'user-uuid', role: 'Manufacturer', nodeId: 'node-uuid-A' };

      const batch = new BatchEntity();
      batch.id = 'batch-uuid';
      batch.status = BatchStatus.CREATED;

      mockManager.findOne
        .mockResolvedValueOnce(batch)
        .mockResolvedValueOnce(new NodeEntity());

      const inventory = new InventoryEntity();
      inventory.batchId = 'batch-uuid';
      inventory.nodeId = 'node-uuid-A';
      inventory.quantityAvailable = 100; // 100 available, enough for 50

      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(inventory),
      };
      mockManager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.createTransfer(dto, user);

      expect(result).toBeDefined();
      expect(result.trackingCode).toContain('SHP-');
      expect(result.quantityShipped).toBe(50);
      expect(result.status).toBe(ShipmentStatus.IN_TRANSIT);
      expect(inventory.quantityAvailable).toBe(50); // 100 - 50 = 50
      expect(batch.status).toBe(BatchStatus.IN_TRANSIT);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('receiveShipment', () => {
    it('should throw NotFoundException if shipment is not found', async () => {
      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockManager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(
        service.receiveShipment('shipment-id', {}, { role: 'Distributor', nodeId: 'node-uuid' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if shipment status is not IN_TRANSIT', async () => {
      const shipment = { id: 'shipment-id', status: ShipmentStatus.RECEIVED };
      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(shipment),
      };
      mockManager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(
        service.receiveShipment('shipment-id', {}, { role: 'Distributor', nodeId: 'node-uuid' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if user is not Admin and does not belong to destinationNodeId', async () => {
      const shipment = { id: 'shipment-id', status: ShipmentStatus.IN_TRANSIT, destinationNodeId: 'node-A' };
      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(shipment),
      };
      mockManager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(
        service.receiveShipment('shipment-id', {}, { role: 'Distributor', nodeId: 'node-B' }),
      ).rejects.toThrow(ForbiddenException);
    });



    it('should successfully receive shipment, execute upsert query, and transition batch status', async () => {
      const shipment = {
        id: 'shipment-id',
        status: ShipmentStatus.IN_TRANSIT,
        destinationNodeId: 'node-B',
        batchId: 'batch-uuid',
        quantityShipped: 50,
        trackingCode: 'SHP-12345',
      };
      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(shipment),
      };
      mockManager.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const batch = new BatchEntity();
      batch.id = 'batch-uuid';
      batch.currentNodeId = 'node-A';
      batch.status = BatchStatus.IN_TRANSIT;

      mockManager.findOne.mockResolvedValueOnce(batch);

      const result = await service.receiveShipment('shipment-id', {}, { role: 'Distributor', nodeId: 'node-B' });

      expect(result).toBeDefined();
      expect(result.status).toBe(ShipmentStatus.RECEIVED);
      expect(batch.currentNodeId).toBe('node-B');
      expect(batch.status).toBe(BatchStatus.RECEIVED);
      expect(mockQueryRunner.query).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });
});
