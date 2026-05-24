import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateShipmentDto {
  @IsNotEmpty({ message: 'Batch ID không được để trống' })
  @IsUUID('4', { message: 'Batch ID không hợp lệ' })
  batchId!: string;

  @IsOptional()
  @IsUUID('4', { message: 'Source Node ID không hợp lệ' })
  sourceNodeId?: string;

  @IsNotEmpty({ message: 'Destination Node ID không hợp lệ' })
  @IsUUID('4', { message: 'Destination Node ID không hợp lệ' })
  destinationNodeId!: string;

  @IsNotEmpty({ message: 'Số lượng chuyển không được để trống' })
  @IsNumber({}, { message: 'Số lượng chuyển phải là số' })
  @Min(0.001, { message: 'Số lượng chuyển phải lớn hơn 0' })
  quantityShipped!: number;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  notes?: string;

  @IsOptional()
  expectedDeliveryDate?: string;
}
