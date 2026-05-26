import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Mật khẩu cũ phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống' })
  oldPassword!: string;

  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(6, { message: 'Mật khẩu mới phải dài tối thiểu 6 ký tự' })
  newPassword!: string;
}
