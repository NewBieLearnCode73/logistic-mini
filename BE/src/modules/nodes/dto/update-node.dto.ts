import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { NodeType } from '../../../common/enums/node-type.enum';

export class UpdateNodeDto {
  @IsOptional()
  @IsString({ message: 'Tên Node phải là chuỗi' })
  name?: string;

  @IsOptional()
  @IsEnum(NodeType, { message: 'Loại Node không hợp lệ' })
  nodeType?: NodeType;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  address?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Vĩ độ phải là số' })
  @Min(-90, { message: 'Vĩ độ phải từ -90' })
  @Max(90, { message: 'Vĩ độ tối đa là 90' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Kinh độ phải là số' })
  @Min(-180, { message: 'Kinh độ phải từ -180' })
  @Max(180, { message: 'Kinh độ tối đa là 180' })
  longitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Version phải là số' })
  version?: number;
}
