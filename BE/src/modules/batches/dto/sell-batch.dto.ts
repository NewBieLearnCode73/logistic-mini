import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SellBatchDto {
  @IsNotEmpty({ message: 'Số lượng bán không được để trống' })
  @IsNumber({}, { message: 'Số lượng bán phải là một số' })
  @Min(0.001, { message: 'Số lượng bán phải lớn hơn 0' })
  quantity!: number;

  @IsOptional()
  @IsString({ message: 'Ngày bán phải là chuỗi định dạng ngày' })
  saleDate?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Giá bán phải là một số' })
  @Min(0, { message: 'Giá bán không được nhỏ hơn 0' })
  salePrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Giá mua phải là một số' })
  @Min(0, { message: 'Giá mua không được nhỏ hơn 0' })
  costPrice?: number;
}
