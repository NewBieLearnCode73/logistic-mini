import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private readonly productRepository;
    constructor(productRepository: Repository<ProductEntity>);
    create(createProductDto: CreateProductDto): Promise<ProductEntity>;
    findAll(options: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        isActive?: boolean | 'all';
    }): Promise<{
        data: ProductEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<ProductEntity>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<ProductEntity>;
    remove(id: string): Promise<void>;
}
