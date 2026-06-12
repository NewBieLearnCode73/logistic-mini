import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository, MoreThan } from 'typeorm';
import { NodesService } from './nodes.service';
import { NodeEntity } from './entities/node.entity';
import { InventoryEntity } from '../batches/entities/inventory.entity';

describe('NodesService', () => {
  let service: NodesService;
  let nodeRepository: Repository<NodeEntity>;
  let inventoryRepository: Repository<InventoryEntity>;

  const mockNodeRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockInventoryRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockNodeQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockInventoryQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NodesService,
        {
          provide: getRepositoryToken(NodeEntity),
          useValue: mockNodeRepository,
        },
        {
          provide: getRepositoryToken(InventoryEntity),
          useValue: mockInventoryRepository,
        },
      ],
    }).compile();

    service = module.get<NodesService>(NodesService);
    nodeRepository = module.get<Repository<NodeEntity>>(getRepositoryToken(NodeEntity));
    inventoryRepository = module.get<Repository<InventoryEntity>>(getRepositoryToken(InventoryEntity));
  });

  describe('delete', () => {
    it('should throw NotFoundException if node does not exist', async () => {
      mockNodeRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.delete('node-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if inventory quantity sum > 0', async () => {
      const node = { id: 'node-id', name: 'Node A', isActive: true } as NodeEntity;
      mockNodeRepository.findOne.mockResolvedValueOnce(node);

      mockInventoryRepository.createQueryBuilder.mockReturnValue(mockInventoryQueryBuilder);
      mockInventoryQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '15' });

      await expect(service.delete('node-id')).rejects.toThrow(
        'Không thể xóa node này vì vẫn còn tồn kho tại đây. Vui lòng chuyển, bán hoặc xử lý hết hàng trước khi xóa node.',
      );
    });

    it('should throw BadRequestException if any inventory record has quantityAvailable > 0', async () => {
      const node = { id: 'node-id', name: 'Node A', isActive: true } as NodeEntity;
      mockNodeRepository.findOne.mockResolvedValueOnce(node);

      mockInventoryRepository.createQueryBuilder.mockReturnValue(mockInventoryQueryBuilder);
      mockInventoryQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '0' });

      const activeInventory = { id: 'inv-id', quantityAvailable: 5 } as any;
      mockInventoryRepository.findOne.mockResolvedValueOnce(activeInventory);

      await expect(service.delete('node-id')).rejects.toThrow(
        'Không thể xóa node này vì vẫn còn tồn kho tại đây. Vui lòng chuyển, bán hoặc xử lý hết hàng trước khi xóa node.',
      );
    });

    it('should soft delete node (isActive = false) if total inventory is 0 and no active records remain', async () => {
      const node = { id: 'node-id', name: 'Node A', isActive: true } as NodeEntity;
      mockNodeRepository.findOne.mockResolvedValueOnce(node);

      mockInventoryRepository.createQueryBuilder.mockReturnValue(mockInventoryQueryBuilder);
      mockInventoryQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '0' });
      mockInventoryRepository.findOne.mockResolvedValueOnce(null);

      mockNodeRepository.save.mockResolvedValueOnce({ ...node, isActive: false });

      await service.delete('node-id');

      expect(node.isActive).toBe(false);
      expect(mockNodeRepository.save).toHaveBeenCalledWith(node);
    });
  });

  describe('findAll', () => {
    it('should filter by isActive = true by default', async () => {
      mockNodeRepository.createQueryBuilder.mockReturnValue(mockNodeQueryBuilder);
      mockNodeQueryBuilder.getManyAndCount.mockResolvedValueOnce([[ { id: 'node-1' } ], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([ { id: 'node-1' } ]);
      expect(mockNodeQueryBuilder.where).toHaveBeenCalledWith('node.isActive = :isActive', { isActive: true });
    });

    it('should filter by isActive = false if specified', async () => {
      mockNodeRepository.createQueryBuilder.mockReturnValue(mockNodeQueryBuilder);
      mockNodeQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

      await service.findAll({ isActive: false });

      expect(mockNodeQueryBuilder.where).toHaveBeenCalledWith('node.isActive = :isActive', { isActive: false });
    });

    it('should not filter by isActive if isActive = "all" is specified', async () => {
      mockNodeRepository.createQueryBuilder.mockReturnValue(mockNodeQueryBuilder);
      mockNodeQueryBuilder.getManyAndCount.mockResolvedValueOnce([[], 0]);

      await service.findAll({ isActive: 'all' });

      expect(mockNodeQueryBuilder.where).not.toHaveBeenCalled();
    });
  });
});
