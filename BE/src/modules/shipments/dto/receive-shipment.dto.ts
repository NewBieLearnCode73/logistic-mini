import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ReceiveShipmentDto {
  @IsOptional()
  @IsNumber({}, { message: 'Số lượng nhận phải là số' })
  @Min(0.001, { message: 'Số lượng nhận phải lớn hơn 0' })
  quantityReceived?: number;

  @IsOptional()
  @IsString({ message: 'Lý do hư hỏng phải là chuỗi' })
  damageReason?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Giá mua phải là số' })
  @Min(0.001, { message: 'Giá mua phải lớn hơn 0' })
  costPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Giá bán phải là số' })
  @Min(0.001, { message: 'Giá bán phải lớn hơn 0' })
  salePrice?: number;
}
