import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { NodeType } from '../../../common/enums/node-type.enum';

export class CreateNodeDto {
  @IsNotEmpty({ message: 'Tên Node không được để trống' })
  @IsString({ message: 'Tên Node phải là chuỗi' })
  name!: string;

  @IsNotEmpty({ message: 'Loại Node không được để trống' })
  @IsEnum(NodeType, { message: 'Loại Node không hợp lệ' })
  nodeType!: NodeType;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  address?: string;

  @IsNotEmpty({ message: 'Vĩ độ không được để trống' })
  @IsNumber({}, { message: 'Vĩ độ phải là số' })
  @Min(-90, { message: 'Vĩ độ phải từ -90' })
  @Max(90, { message: 'Vĩ độ tối đa là 90' })
  latitude!: number;

  @IsNotEmpty({ message: 'Kinh độ không được để trống' })
  @IsNumber({}, { message: 'Kinh độ phải là số' })
  @Min(-180, { message: 'Kinh độ phải từ -180' })
  @Max(180, { message: 'Kinh độ tối đa là 180' })
  longitude!: number;
}
