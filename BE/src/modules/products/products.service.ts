import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const existing = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
      withDeleted: true,
    });
    if (existing) {
      throw new BadRequestException('Mã SKU sản phẩm đã tồn tại trong hệ thống');
    }

    const product = this.productRepository.create({
      name: createProductDto.name,
      sku: createProductDto.sku,
      unit: createProductDto.unit,
      description: createProductDto.description || null,
      category: createProductDto.category || null,
    });

    return this.productRepository.save(product);
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
  }): Promise<{ data: ProductEntity[]; total: number; page: number; limit: number }> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    const query = this.productRepository.createQueryBuilder('product')
      .where('product.deletedAt IS NULL');

    if (options.search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    if (options.category) {
      query.andWhere('product.category = :category', { category: options.category });
    }

    if (options.isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', { isActive: options.isActive });
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

  async findById(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(`Sản phẩm với ID ${id} không tồn tại`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductEntity> {
    const product = await this.findById(id);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existing = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
        withDeleted: true,
      });
      if (existing) {
        throw new BadRequestException('Mã SKU sản phẩm đã tồn tại trong hệ thống');
      }
    }

    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id);
    await this.productRepository.softRemove(product);
  }
}
