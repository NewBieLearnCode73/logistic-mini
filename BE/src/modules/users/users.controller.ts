import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums/role.enum';

@Controller('users')
@Roles(RoleName.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.usersService.create(createUserDto);
    // Return both user and password in response for Admin creation and testing
    return {
      message: 'Tạo tài khoản nhân sự mới thành công',
      data: result.user,
      temporaryPassword: result.temporaryPassword,
    };
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('role') role?: string,
    @Query('nodeId') nodeId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    let isActiveBool: boolean | undefined = undefined;

    if (isActive === 'true') isActiveBool = true;
    if (isActive === 'false') isActiveBool = false;

    return this.usersService.findAll({
      page: pageNum,
      limit: limitNum,
      role,
      nodeId,
      isActive: isActiveBool,
    });
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return {
      message: 'Cập nhật thông tin nhân sự thành công',
      data: updatedUser,
    };
  }

  @Patch(':id/toggle-active')
  async toggleActive(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
    @Request() req: any,
  ) {
    const updatedUser = await this.usersService.toggleActive(id, req.user.userId);
    return {
      message: updatedUser.isActive
        ? 'Kích hoạt tài khoản nhân sự thành công'
        : 'Vô hiệu hóa tài khoản nhân sự thành công',
      data: updatedUser,
    };
  }

  @Post(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('id', new ParseUUIDPipe({ version: '4', errorHttpStatusCode: HttpStatus.BAD_REQUEST })) id: string,
  ) {
    const result = await this.usersService.resetPassword(id);
    return {
      message: 'Cấp lại mật khẩu nhân sự thành công',
      data: result.user,
      temporaryPassword: result.temporaryPassword,
    };
  }
}
