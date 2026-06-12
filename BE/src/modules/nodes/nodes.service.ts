import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { NodeEntity } from './entities/node.entity';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { InventoryEntity } from '../batches/entities/inventory.entity';

@Injectable()
export class NodesService {
  constructor(
    @InjectRepository(NodeEntity)
    private readonly nodeRepository: Repository<NodeEntity>,

    @InjectRepository(InventoryEntity)
    private readonly inventoryRepository: Repository<InventoryEntity>,
  ) {}

  async create(createNodeDto: CreateNodeDto): Promise<NodeEntity> {
    const normalizedName = createNodeDto.name.trim().toLowerCase();
    const existingName = await this.nodeRepository.createQueryBuilder('node')
      .where('LOWER(node.name) = :name', { name: normalizedName })
      .getOne();
    if (existingName) {
      throw new ConflictException(`Điểm nút với tên "${createNodeDto.name}" đã tồn tại`);
    }

    if (createNodeDto.latitude !== undefined && createNodeDto.longitude !== undefined) {
      const existingCoords = await this.nodeRepository.findOne({
        where: {
          latitude: createNodeDto.latitude,
          longitude: createNodeDto.longitude,
        },
      });
      if (existingCoords) {
        throw new ConflictException(`Điểm nút với tọa độ (${createNodeDto.latitude}, ${createNodeDto.longitude}) đã tồn tại`);
      }
    }

    const node = this.nodeRepository.create(createNodeDto);
    return this.nodeRepository.save(node);
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    includeInventory?: boolean;
    isActive?: boolean | 'all';
  }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const query = this.nodeRepository.createQueryBuilder('node');

    const isActiveFilter = options.isActive !== undefined ? options.isActive : true;
    if (isActiveFilter !== 'all') {
      query.where('node.isActive = :isActive', { isActive: isActiveFilter });
    }

    query.orderBy('node.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    const [nodes, total] = await query.getManyAndCount();

    let data = nodes as any[];

    if (options.includeInventory) {
      const nodeIds = nodes.map((n) => n.id);
      if (nodeIds.length > 0) {
        const inventories = await this.inventoryRepository.createQueryBuilder('inv')
          .leftJoinAndSelect('inv.batch', 'batch')
          .leftJoinAndSelect('batch.product', 'product')
          .where('inv.nodeId IN (:...nodeIds)', { nodeIds })
          .getMany();

        data = nodes.map((node) => {
          const nodeInv = inventories.filter((inv) => inv.nodeId === node.id);
          return {
            ...node,
            inventories: nodeInv,
          };
        });
      } else {
        data = nodes.map((node) => ({ ...node, inventories: [] }));
      }
    }

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<NodeEntity> {
    const node = await this.nodeRepository.findOne({ where: { id } });
    if (!node) {
      throw new NotFoundException(`Node với ID ${id} không tồn tại`);
    }
    return node;
  }

  async findDetails(id: string): Promise<any> {
    const node = await this.findById(id);

    const inventories = await this.inventoryRepository.createQueryBuilder('inv')
      .leftJoinAndSelect('inv.batch', 'batch')
      .leftJoinAndSelect('batch.product', 'product')
      .where('inv.nodeId = :nodeId', { nodeId: id })
      .getMany();

    const groupedMap = new Map<string, {
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalValue: number;
    }>();

    for (const inv of inventories) {
      if (!inv.batch || !inv.batch.product) continue;
      const product = inv.batch.product;
      const qty = Number(inv.quantityAvailable || 0);
      const unitPrice = Number(product.unitPrice || 0);

      const existing = groupedMap.get(product.id);
      if (existing) {
        existing.quantity = Number((existing.quantity + qty).toFixed(3));
        existing.totalValue = Number((existing.quantity * unitPrice).toFixed(2));
      } else {
        groupedMap.set(product.id, {
          productId: product.id,
          productName: product.name,
          sku: product.sku || '',
          quantity: qty,
          unit: product.unit || '',
          unitPrice: unitPrice,
          totalValue: Number((qty * unitPrice).toFixed(2)),
        });
      }
    }

    const inventoryGrouped = Array.from(groupedMap.values()).filter(item => item.quantity > 0);

    return {
      ...node,
      inventory: inventoryGrouped,
    };
  }

  async update(id: string, updateNodeDto: UpdateNodeDto): Promise<NodeEntity> {
    const node = await this.findById(id);

    if (updateNodeDto.name !== undefined && updateNodeDto.name.trim().toLowerCase() !== node.name.trim().toLowerCase()) {
      const normalizedName = updateNodeDto.name.trim().toLowerCase();
      const existingName = await this.nodeRepository.createQueryBuilder('node')
        .where('LOWER(node.name) = :name AND node.id != :id', { name: normalizedName, id })
        .getOne();
      if (existingName) {
        throw new ConflictException(`Điểm nút với tên "${updateNodeDto.name}" đã tồn tại`);
      }
      node.name = updateNodeDto.name;
    }

    const lat = updateNodeDto.latitude !== undefined ? updateNodeDto.latitude : node.latitude;
    const lng = updateNodeDto.longitude !== undefined ? updateNodeDto.longitude : node.longitude;

    if (
      (updateNodeDto.latitude !== undefined && updateNodeDto.latitude !== node.latitude) ||
      (updateNodeDto.longitude !== undefined && updateNodeDto.longitude !== node.longitude)
    ) {
      if (lat && lng) {
        const existingCoords = await this.nodeRepository.createQueryBuilder('node')
          .where('node.latitude = :lat AND node.longitude = :lng AND node.id != :id', { lat, lng, id })
          .getOne();
        if (existingCoords) {
          throw new ConflictException(`Điểm nút với tọa độ (${lat}, ${lng}) đã tồn tại`);
        }
      }
    }

    if (updateNodeDto.nodeType !== undefined) node.nodeType = updateNodeDto.nodeType;
    if (updateNodeDto.address !== undefined) node.address = updateNodeDto.address;
    if (updateNodeDto.latitude !== undefined) node.latitude = updateNodeDto.latitude;
    if (updateNodeDto.longitude !== undefined) node.longitude = updateNodeDto.longitude;

    if (updateNodeDto.version !== undefined) {
      if (node.version !== updateNodeDto.version) {
        throw new ConflictException('Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng tải lại trang.');
      }
      node.version = updateNodeDto.version;
    }

    try {
      return await this.nodeRepository.save(node);
    } catch (error: any) {
      if (error.name === 'OptimisticLockVersionMismatchError') {
        throw new ConflictException('Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng tải lại trang.');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const node = await this.findById(id);

    const sumResult = await this.inventoryRepository.createQueryBuilder('inv')
      .select('SUM(inv.quantityAvailable)', 'total')
      .where('inv.nodeId = :nodeId', { nodeId: id })
      .getRawOne();
    const totalQty = Number(sumResult?.total || 0);

    const activeInventory = await this.inventoryRepository.findOne({
      where: {
        nodeId: id,
        quantityAvailable: MoreThan(0),
      },
    });

    if (totalQty > 0 || activeInventory) {
      throw new BadRequestException(
        'Không thể xóa node này vì vẫn còn tồn kho tại đây. Vui lòng chuyển, bán hoặc xử lý hết hàng trước khi xóa node.',
      );
    }

    node.isActive = false;
    await this.nodeRepository.save(node);
  }
}
