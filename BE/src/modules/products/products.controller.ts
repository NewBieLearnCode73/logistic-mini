import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums/role.enum';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(RoleName.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductEntity> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Roles(
    RoleName.ADMIN,
    RoleName.MANUFACTURER,
    RoleName.DISTRIBUTOR,
    RoleName.RETAILER,
    RoleName.CONSUMER,
  )
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    let isActiveVal: boolean | 'all' | undefined = undefined;

    if (isActive === 'true') {
      isActiveVal = true;
    } else if (isActive === 'false') {
      isActiveVal = false;
    } else if (isActive === 'all') {
      isActiveVal = 'all';
    }

    return this.productsService.findAll({
      page: pageNum,
      limit: limitNum,
      search,
      category,
      isActive: isActiveVal,
    });
  }

  @Get(':id')
  @Roles(
    RoleName.ADMIN,
    RoleName.MANUFACTURER,
    RoleName.DISTRIBUTOR,
    RoleName.RETAILER,
    RoleName.CONSUMER,
  )
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ): Promise<ProductEntity> {
    return this.productsService.findById(id);
  }

  @Put(':id')
  @Roles(RoleName.ADMIN)
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ): Promise<void> {
    await this.productsService.remove(id);
  }
}
