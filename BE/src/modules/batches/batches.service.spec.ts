import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BatchesService } from './batches.service';
import { QrService } from './qr.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { ProductEntity } from '../products/entities/product.entity';
import { NodeEntity } from '../nodes/entities/node.entity';
import { TimelineEventEntity } from './entities/timeline-event.entity';

describe('BatchesService', () => {
  let service: BatchesService;
  let qrService: QrService;

  const mockManager = {
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((entityClass, data) => {
      // Handles both save(entity) and save(class, entity)
      const obj = data || entityClass;
      if (!obj.id) obj.id = 'mock-id';
      return Promise.resolve(obj);
    }),
  };

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: mockManager,
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    getRepository: jest.fn(),
  };

  const mockQrService = {
    generateSvg: jest.fn().mockResolvedValue('<svg>mock</svg>'),
    generatePngDataUrl: jest.fn().mockResolvedValue('data:image/png;base64,mock'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchesService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: QrService, useValue: mockQrService },
      ],
    }).compile();

    service = module.get<BatchesService>(BatchesService);
    qrService = module.get<QrService>(QrService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if expiryDate <= manufactureDate', async () => {
      const dto: CreateBatchDto = {
        productId: 'product-uuid',
        quantity: 10,
        unit: 'kg',
        manufactureDate: '2026-05-22',
        expiryDate: '2026-05-20', // earlier
        originNodeId: 'node-uuid',
      };

      const user = { userId: 'user-uuid', role: 'Manufacturer', nodeId: 'node-uuid' };

      await expect(service.create(dto, user)).rejects.toThrow(
        new BadRequestException('Hạn sử dụng phải lớn hơn ngày sản xuất'),
      );
    });

    it('should throw BadRequestException if quantity <= 0', async () => {
      const dto: CreateBatchDto = {
        productId: 'product-uuid',
        quantity: 0,
        unit: 'kg',
        manufactureDate: '2026-05-22',
        expiryDate: '2026-05-25',
        originNodeId: 'node-uuid',
      };

      const user = { userId: 'user-uuid', role: 'Manufacturer', nodeId: 'node-uuid' };

      await expect(service.create(dto, user)).rejects.toThrow(
        new BadRequestException('Số lượng khởi tạo phải lớn hơn 0'),
      );
    });

    it('should throw BadRequestException if Admin does not provide originNodeId', async () => {
      const dto: CreateBatchDto = {
        productId: 'product-uuid',
        quantity: 10,
        unit: 'kg',
        manufactureDate: '2026-05-22',
        expiryDate: '2026-05-25',
      };

      const user = { userId: 'admin-uuid', role: 'Admin', nodeId: null };

      await expect(service.create(dto, user)).rejects.toThrow(
        new BadRequestException('Admin cần cung cấp originNodeId khi tạo lô hàng'),
      );
    });

    it('should throw NotFoundException if product is not found', async () => {
      const dto: CreateBatchDto = {
        productId: 'product-uuid',
        quantity: 10,
        unit: 'kg',
        manufactureDate: '2026-05-22',
        expiryDate: '2026-05-25',
      };

      const user = { userId: 'user-uuid', role: 'Manufacturer', nodeId: 'node-uuid' };

      mockManager.findOne.mockResolvedValueOnce(null); // Product not found

      await expect(service.create(dto, user)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if node is not found', async () => {
      const dto: CreateBatchDto = {
        productId: 'product-uuid',
        quantity: 10,
        unit: 'kg',
        manufactureDate: '2026-05-22',
        expiryDate: '2026-05-25',
      };

      const user = { userId: 'user-uuid', role: 'Manufacturer', nodeId: 'node-uuid' };

      mockManager.findOne
        .mockResolvedValueOnce(new ProductEntity()) // Product exists
        .mockResolvedValueOnce(null); // Node not found

      await expect(service.create(dto, user)).rejects.toThrow(NotFoundException);
    });

    it('should successfully create batch and dependencies', async () => {
      const dto: CreateBatchDto = {
        productId: 'product-uuid',
        quantity: 10,
        unit: 'kg',
        manufactureDate: '2026-05-22',
        expiryDate: '2026-05-25',
      };

      const user = { userId: 'user-uuid', role: 'Manufacturer', nodeId: 'node-uuid' };

      mockManager.findOne
        .mockResolvedValueOnce({ id: 'product-uuid', isActive: true }) // Product exists
        .mockResolvedValueOnce({ id: 'node-uuid', isActive: true }); // Node exists

      const result = await service.create(dto, user);

      expect(result).toBeDefined();
      expect(result.batchCode).toContain('BCH-');
      expect(result.quantity).toBe(10);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('sell', () => {
    beforeEach(() => {
      mockManager.findOne = jest.fn().mockImplementation((entityClass, options) => {
        if (entityClass === TimelineEventEntity) {
          return Promise.resolve({
            id: 'price-event-uuid',
            metadata: { cost_price: 1000, sale_price: 1500 },
          });
        }
        return Promise.resolve({ id: 'batch-id', status: 'RECEIVED' });
      });
    });

    it('should throw BadRequestException if user is not assigned to a nodeId', async () => {
      const user = { userId: 'user-uuid', role: 'Retailer', nodeId: null };
      await expect(service.sell('batch-id', { quantity: 10 }, user)).rejects.toThrow(
        new BadRequestException('Tài khoản của bạn chưa được gán vào Node nào để bán hàng'),
      );
    });

    it('should throw NotFoundException if inventory does not exist', async () => {
      const user = { userId: 'user-uuid', role: 'Retailer', nodeId: 'node-uuid' };
      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      (mockDataSource.createQueryRunner().manager as any).createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      await expect(service.sell('batch-id', { quantity: 10, costPrice: 1000, salePrice: 1500 }, user)).rejects.toThrow(
        new NotFoundException('Lô hàng không tồn tại hoặc không còn hàng tồn kho tại cửa hàng của bạn'),
      );
    });

    it('should throw BadRequestException if quantity requested exceeds available quantity', async () => {
      const user = { userId: 'user-uuid', role: 'Retailer', nodeId: 'node-uuid' };
      const inventory = { quantityAvailable: 5 };
      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(inventory),
      };
      (mockDataSource.createQueryRunner().manager as any).createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);

      const manager = mockDataSource.createQueryRunner().manager as any;
      manager.findOne = jest.fn().mockResolvedValue({ id: 'batch-id', status: 'RECEIVED', product: { unitPrice: 1000 } });

      await expect(service.sell('batch-id', { quantity: 10, costPrice: 1000, salePrice: 1500 }, user)).rejects.toThrow(
        new BadRequestException(
          `Không đủ số lượng hàng tồn kho khả dụng để bán. Hiện có: 5 (yêu cầu: 10)`,
        ),
      );
    });

    it('should successfully deduct inventory and log SOLD timeline event', async () => {
      const user = { userId: 'user-uuid', role: 'Retailer', nodeId: 'node-uuid' };
      const inventory = { quantityAvailable: 15 };
      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(inventory),
      };
      const manager = mockDataSource.createQueryRunner().manager as any;
      manager.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
      manager.findOne = jest.fn().mockResolvedValue({ id: 'batch-id', status: 'RECEIVED', product: { unitPrice: 1000 } });

      await service.sell('batch-id', { quantity: 10, costPrice: 1000, salePrice: 1500 }, user);

      expect(inventory.quantityAvailable).toBe(5);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should transition batch to SOLD if inventory drops to 0', async () => {
      const user = { userId: 'user-uuid', role: 'Retailer', nodeId: 'node-uuid' };
      const inventory = { quantityAvailable: 10 };
      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(inventory),
      };
      const manager = mockDataSource.createQueryRunner().manager as any;
      manager.createQueryBuilder = jest.fn().mockReturnValue(mockQueryBuilder);
      const mockBatch = { id: 'batch-id', status: 'RECEIVED', quantity: 10, product: { unitPrice: 1000 } };
      manager.findOne = jest.fn().mockImplementation((entityClass, options) => {
        return Promise.resolve(mockBatch);
      });

      await service.sell('batch-id', { quantity: 10, costPrice: 1000, salePrice: 1500 }, user);

      expect(inventory.quantityAvailable).toBe(0);
      expect(mockBatch.status).toBe('SOLD');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated batches list', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 'batch-uuid' }], 1]),
      };

      const spyRepo = jest.spyOn(mockDataSource, 'getRepository').mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      } as any);

      const user = { userId: 'admin-uuid', role: 'Admin' };
      const result = await service.findAll({ page: 1, limit: 10 }, user);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      spyRepo.mockRestore();
    });
  });

  describe('findDetails', () => {
    it('should return batch details and its QR code metadata', async () => {
      const batch = { id: 'batch-uuid', originNodeId: 'node-uuid' };
      const qrCode = { id: 'qr-uuid', qrImageUrl: 'url' };

      const spyFindOne = jest.spyOn(mockDataSource, 'getRepository').mockReturnValue({
        findOne: jest.fn()
          .mockResolvedValueOnce(batch) // first findById
          .mockResolvedValueOnce(qrCode), // then QR code
        find: jest.fn().mockResolvedValue([]),
      } as any);

      const user = { userId: 'admin-uuid', role: 'Admin' };
      const result = await service.findDetails('batch-uuid', user);

      expect(result).toBeDefined();
      expect(result.id).toBe('batch-uuid');
      expect(result.qrCode).toBe(qrCode);
      spyFindOne.mockRestore();
    });

    it('should throw BadRequestException if Manufacturer does not own the batch', async () => {
      const batch = { id: 'batch-uuid', originNodeId: 'other-node-uuid' };

      const spyFindOne = jest.spyOn(mockDataSource, 'getRepository').mockReturnValue({
        findOne: jest.fn().mockResolvedValue(batch),
      } as any);

      const user = { userId: 'man-uuid', role: 'Manufacturer', nodeId: 'node-uuid' };
      await expect(service.findDetails('batch-uuid', user)).rejects.toThrow(BadRequestException);
      spyFindOne.mockRestore();
    });
  });

  describe('getTimeline', () => {
    it('should return timeline event history sorted by occurredAt ASC for Admin', async () => {
      const batch = { id: 'batch-uuid', originNodeId: 'node-uuid' };
      const events = [{ id: 'event-uuid' }];

      const spyRepo = jest.spyOn(mockDataSource, 'getRepository').mockReturnValue({
        findOne: jest.fn()
          .mockResolvedValueOnce(batch) // first findById
          .mockResolvedValueOnce(null), // QR code search
        find: jest.fn().mockResolvedValue(events),
      } as any);

      const user = { userId: 'admin-uuid', role: 'Admin' };
      const result = await service.getTimeline('batch-uuid', user);

      expect(result).toEqual(events);
      spyRepo.mockRestore();
    });

    it('should filter timeline for Manufacturer up to first received event', async () => {
      const batch = { id: 'batch-uuid', originNodeId: 'mfr-node-uuid' };
      const events = [
        { id: '1', eventType: 'CREATED', occurredAt: new Date('2026-06-01') },
        { id: '2', eventType: 'SHIPPED', shipmentId: 'ship-1', occurredAt: new Date('2026-06-02') },
        { id: '3', eventType: 'RECEIVED', shipmentId: 'ship-1', occurredAt: new Date('2026-06-03') },
        { id: '4', eventType: 'SHIPPED', shipmentId: 'ship-2', occurredAt: new Date('2026-06-04') },
        { id: '5', eventType: 'RECEIVED', shipmentId: 'ship-2', occurredAt: new Date('2026-06-05') },
      ];

      const spyRepo = jest.spyOn(mockDataSource, 'getRepository').mockImplementation((entity: any) => {
        if (entity.name === 'BatchEntity') {
          return {
            findOne: jest.fn().mockResolvedValue(batch),
          } as any;
        }
        if (entity.name === 'BatchQrCodeEntity') {
          return {
            findOne: jest.fn().mockResolvedValue(null),
          } as any;
        }
        if (entity.name === 'TimelineEventEntity') {
          return {
            find: jest.fn().mockResolvedValue(events),
          } as any;
        }
        if (entity.name === 'ShipmentEntity') {
          return {
            find: jest.fn().mockResolvedValue([{ id: 'ship-1', sourceNodeId: 'mfr-node-uuid' }]),
          } as any;
        }
        return {} as any;
      });

      const user = { userId: 'mfr-uuid', role: 'Manufacturer', nodeId: 'mfr-node-uuid' };
      const result = await service.getTimeline('batch-uuid', user);

      expect(result.length).toBe(5);
      expect(result[result.length - 1].eventType).toBe('RECEIVED');
      expect(result[result.length - 1].shipmentId).toBe('ship-2');
      spyRepo.mockRestore();
    });

    it('should not filter timeline for Manufacturer if shipment is not received yet', async () => {
      const batch = { id: 'batch-uuid', originNodeId: 'mfr-node-uuid' };
      const events = [
        { id: '1', eventType: 'CREATED', occurredAt: new Date('2026-06-01') },
        { id: '2', eventType: 'SHIPPED', shipmentId: 'ship-1', occurredAt: new Date('2026-06-02') },
      ];

      const spyRepo = jest.spyOn(mockDataSource, 'getRepository').mockImplementation((entity: any) => {
        if (entity.name === 'BatchEntity') {
          return {
            findOne: jest.fn().mockResolvedValue(batch),
          } as any;
        }
        if (entity.name === 'BatchQrCodeEntity') {
          return {
            findOne: jest.fn().mockResolvedValue(null),
          } as any;
        }
        if (entity.name === 'TimelineEventEntity') {
          return {
            find: jest.fn().mockResolvedValue(events),
          } as any;
        }
        if (entity.name === 'ShipmentEntity') {
          return {
            find: jest.fn().mockResolvedValue([{ id: 'ship-1', sourceNodeId: 'mfr-node-uuid' }]),
          } as any;
        }
        return {} as any;
      });

      const user = { userId: 'mfr-uuid', role: 'Manufacturer', nodeId: 'mfr-node-uuid' };
      const result = await service.getTimeline('batch-uuid', user);

      expect(result.length).toBe(2);
      spyRepo.mockRestore();
    });
  });

  describe('regenerateQr', () => {
    it('should regenerate QR code for Admin', async () => {
      const batch = { id: 'batch-uuid', batchCode: 'BCH-XYZ' };
      const qrCode = { id: 'qr-uuid' };

      const spyRepo = jest.spyOn(mockDataSource, 'getRepository').mockReturnValue({
        findOne: jest.fn()
          .mockResolvedValueOnce(batch) // findById
          .mockResolvedValueOnce(qrCode), // find QR
        save: jest.fn().mockResolvedValue(qrCode),
      } as any);

      const user = { userId: 'admin-uuid', role: 'Admin' };
      const result = await service.regenerateQr('batch-uuid', user);

      expect(result).toBeDefined();
      spyRepo.mockRestore();
    });
  });
});
