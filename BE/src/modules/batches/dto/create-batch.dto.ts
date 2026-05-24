import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateBatchDto {
  @IsNotEmpty({ message: 'Product ID không được để trống' })
  @IsUUID('4', { message: 'Product ID phải là UUID hợp lệ' })
  productId!: string;

  @IsNotEmpty({ message: 'Số lượng không được để trống' })
  @IsNumber({}, { message: 'Số lượng phải là một số' })
  @Min(0.001, { message: 'Số lượng khởi tạo phải lớn hơn 0' })
  quantity!: number;

  @IsOptional()
  @IsString({ message: 'Đơn vị tính phải là chuỗi' })
  unit?: string;

  @IsNotEmpty({ message: 'Ngày sản xuất không được để trống' })
  @IsString({ message: 'Ngày sản xuất phải là chuỗi ngày hợp lệ' })
  manufactureDate!: string;

  @IsNotEmpty({ message: 'Hạn sử dụng không được để trống' })
  @IsString({ message: 'Hạn sử dụng phải là chuỗi ngày hợp lệ' })
  expiryDate!: string;

  @IsOptional()
  @IsUUID('4', { message: 'Origin Node ID phải là UUID hợp lệ' })
  originNodeId?: string;
}
