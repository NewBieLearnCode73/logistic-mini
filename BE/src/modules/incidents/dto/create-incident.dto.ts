import { IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateIncidentDto {
  @IsNotEmpty({ message: 'Shipment ID không được để trống' })
  @IsUUID('4', { message: 'Shipment ID phải là UUID hợp lệ' })
  shipmentId!: string;

  @IsNotEmpty({ message: 'Loại sự cố không được để trống' })
  @IsString({ message: 'Loại sự cố phải là chuỗi' })
  incidentType!: string; // MISSING | DAMAGED | FRAUD | OTHER

  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString({ message: 'Mô tả phải là chuỗi' })
  @MinLength(20, { message: 'Mô tả sự cố phải tối thiểu 20 ký tự' })
  description!: string;

  @IsOptional()
  @IsString({ message: 'Mức độ ưu tiên phải là chuỗi' })
  priority?: string; // LOW | MEDIUM | HIGH | CRITICAL
}
