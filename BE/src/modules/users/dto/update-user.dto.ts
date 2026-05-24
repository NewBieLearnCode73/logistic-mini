import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { RoleName } from '../../../common/enums/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  fullName?: string;

  @IsOptional()
  @IsEnum(RoleName, { message: 'Vai trò không hợp lệ' })
  role?: RoleName;

  @IsOptional()
  @IsUUID('4', { message: 'Node ID phải là UUID hợp lệ' })
  nodeId?: string | null;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoạt động phải là boolean' })
  isActive?: boolean;
}
