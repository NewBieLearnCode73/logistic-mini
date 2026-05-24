"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const node_entity_1 = require("./entities/node.entity");
const inventory_entity_1 = require("../batches/entities/inventory.entity");
let NodesService = class NodesService {
    nodeRepository;
    inventoryRepository;
    constructor(nodeRepository, inventoryRepository) {
        this.nodeRepository = nodeRepository;
        this.inventoryRepository = inventoryRepository;
    }
    async create(createNodeDto) {
        const normalizedName = createNodeDto.name.trim().toLowerCase();
        const existingName = await this.nodeRepository.createQueryBuilder('node')
            .where('LOWER(node.name) = :name', { name: normalizedName })
            .getOne();
        if (existingName) {
            throw new common_1.ConflictException(`Điểm nút với tên "${createNodeDto.name}" đã tồn tại`);
        }
        if (createNodeDto.latitude !== undefined && createNodeDto.longitude !== undefined) {
            const existingCoords = await this.nodeRepository.findOne({
                where: {
                    latitude: createNodeDto.latitude,
                    longitude: createNodeDto.longitude,
                },
            });
            if (existingCoords) {
                throw new common_1.ConflictException(`Điểm nút với tọa độ (${createNodeDto.latitude}, ${createNodeDto.longitude}) đã tồn tại`);
            }
        }
        const node = this.nodeRepository.create(createNodeDto);
        return this.nodeRepository.save(node);
    }
    async findAll(options) {
        const page = options.page && options.page > 0 ? options.page : 1;
        const limit = options.limit && options.limit > 0 ? options.limit : 10;
        const skip = (page - 1) * limit;
        const [nodes, total] = await this.nodeRepository.findAndCount({
            order: { createdAt: 'DESC' },
            take: limit,
            skip,
        });
        let data = nodes;
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
            }
            else {
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
    async findById(id) {
        const node = await this.nodeRepository.findOne({ where: { id } });
        if (!node) {
            throw new common_1.NotFoundException(`Node với ID ${id} không tồn tại`);
        }
        return node;
    }
    async update(id, updateNodeDto) {
        const node = await this.findById(id);
        if (updateNodeDto.name !== undefined && updateNodeDto.name.trim().toLowerCase() !== node.name.trim().toLowerCase()) {
            const normalizedName = updateNodeDto.name.trim().toLowerCase();
            const existingName = await this.nodeRepository.createQueryBuilder('node')
                .where('LOWER(node.name) = :name AND node.id != :id', { name: normalizedName, id })
                .getOne();
            if (existingName) {
                throw new common_1.ConflictException(`Điểm nút với tên "${updateNodeDto.name}" đã tồn tại`);
            }
            node.name = updateNodeDto.name;
        }
        const lat = updateNodeDto.latitude !== undefined ? updateNodeDto.latitude : node.latitude;
        const lng = updateNodeDto.longitude !== undefined ? updateNodeDto.longitude : node.longitude;
        if ((updateNodeDto.latitude !== undefined && updateNodeDto.latitude !== node.latitude) ||
            (updateNodeDto.longitude !== undefined && updateNodeDto.longitude !== node.longitude)) {
            if (lat && lng) {
                const existingCoords = await this.nodeRepository.createQueryBuilder('node')
                    .where('node.latitude = :lat AND node.longitude = :lng AND node.id != :id', { lat, lng, id })
                    .getOne();
                if (existingCoords) {
                    throw new common_1.ConflictException(`Điểm nút với tọa độ (${lat}, ${lng}) đã tồn tại`);
                }
            }
        }
        if (updateNodeDto.nodeType !== undefined)
            node.nodeType = updateNodeDto.nodeType;
        if (updateNodeDto.address !== undefined)
            node.address = updateNodeDto.address;
        if (updateNodeDto.latitude !== undefined)
            node.latitude = updateNodeDto.latitude;
        if (updateNodeDto.longitude !== undefined)
            node.longitude = updateNodeDto.longitude;
        if (updateNodeDto.version !== undefined) {
            node.version = updateNodeDto.version;
        }
        try {
            return await this.nodeRepository.save(node);
        }
        catch (error) {
            if (error.name === 'OptimisticLockVersionMismatchError') {
                throw new common_1.ConflictException('Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng tải lại trang.');
            }
            throw error;
        }
    }
    async delete(id) {
        const node = await this.findById(id);
        const activeInventory = await this.inventoryRepository.findOne({
            where: {
                nodeId: id,
                quantityAvailable: (0, typeorm_2.MoreThan)(0),
            },
        });
        if (activeInventory) {
            throw new common_1.BadRequestException(`Không thể xóa/vô hiệu hóa điểm nút vì vẫn còn hàng tồn kho tại đây (Số lượng: ${activeInventory.quantityAvailable})`);
        }
        await this.nodeRepository.softRemove(node);
    }
};
exports.NodesService = NodesService;
exports.NodesService = NodesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(node_entity_1.NodeEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(inventory_entity_1.InventoryEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NodesService);
//# sourceMappingURL=nodes.service.js.map