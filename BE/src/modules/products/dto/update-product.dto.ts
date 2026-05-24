import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @MaxLength(200, { message: 'Tên sản phẩm tối đa 200 ký tự' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Mã SKU phải là chuỗi' })
  @MaxLength(100, { message: 'Mã SKU tối đa 100 ký tự' })
  sku?: string;

  @IsOptional()
  @IsString({ message: 'Đơn vị tính phải là chuỗi' })
  @MaxLength(50, { message: 'Đơn vị tính tối đa 50 ký tự' })
  unit?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Danh mục phải là chuỗi' })
  @MaxLength(100, { message: 'Danh mục tối đa 100 ký tự' })
  category?: string;
}
