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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
let ProductsService = class ProductsService {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async create(createProductDto) {
        const existing = await this.productRepository.findOne({
            where: { sku: createProductDto.sku },
            withDeleted: true,
        });
        if (existing) {
            throw new common_1.BadRequestException('Mã SKU sản phẩm đã tồn tại trong hệ thống');
        }
        const product = this.productRepository.create({
            name: createProductDto.name,
            sku: createProductDto.sku,
            unit: createProductDto.unit,
            unitPrice: createProductDto.unitPrice,
            description: createProductDto.description || null,
            category: createProductDto.category || null,
        });
        return this.productRepository.save(product);
    }
    async findAll(options) {
        const page = options.page && options.page > 0 ? options.page : 1;
        const limit = options.limit && options.limit > 0 ? options.limit : 10;
        const skip = (page - 1) * limit;
        const query = this.productRepository.createQueryBuilder('product')
            .where('product.deletedAt IS NULL');
        if (options.search) {
            query.andWhere('(product.name ILIKE :search OR product.sku ILIKE :search)', { search: `%${options.search}%` });
        }
        if (options.category) {
            query.andWhere('product.category = :category', { category: options.category });
        }
        const isActiveFilter = options.isActive !== undefined ? options.isActive : true;
        if (isActiveFilter !== 'all') {
            query.andWhere('product.isActive = :isActive', { isActive: isActiveFilter });
        }
        query.orderBy('product.createdAt', 'DESC')
            .take(limit)
            .skip(skip);
        const [data, total] = await query.getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findById(id) {
        const product = await this.productRepository.findOne({
            where: { id },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Sản phẩm với ID ${id} không tồn tại`);
        }
        return product;
    }
    async update(id, updateProductDto) {
        const product = await this.findById(id);
        if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
            const existing = await this.productRepository.findOne({
                where: { sku: updateProductDto.sku },
                withDeleted: true,
            });
            if (existing) {
                throw new common_1.BadRequestException('Mã SKU sản phẩm đã tồn tại trong hệ thống');
            }
        }
        const unitPriceChanged = updateProductDto.unitPrice !== undefined &&
            Number(updateProductDto.unitPrice) !== Number(product.unitPrice);
        Object.assign(product, updateProductDto);
        const savedProduct = await this.productRepository.save(product);
        if (unitPriceChanged) {
            await this.productRepository.manager.query(`UPDATE batches SET total_value = quantity * $1 WHERE product_id = $2`, [savedProduct.unitPrice, id]);
        }
        return savedProduct;
    }
    async remove(id) {
        const product = await this.findById(id);
        product.isActive = false;
        await this.productRepository.save(product);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map