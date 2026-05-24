import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { RoleName } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  fullName!: string;

  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  @IsEnum(RoleName, { message: 'Vai trò không hợp lệ' })
  role!: RoleName;

  @IsOptional()
  @IsUUID('4', { message: 'Node ID phải là UUID hợp lệ' })
  nodeId?: string | null;
}
