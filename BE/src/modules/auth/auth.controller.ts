import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Request() req: any) {
    const meta = {
      ip: req.ip || req.headers?.['x-forwarded-for'] || null,
      userAgent: req.headers?.['user-agent'] || null,
    };
    return this.authService.login(loginDto, meta);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: { user: { userId: string; role: string; nodeId: string | null } }) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      return null;
    }
    // Exclude passwordHash from response
    const { passwordHash, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: { user: { userId: string } },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(req.user.userId, changePasswordDto);
    return { message: 'Thay đổi mật khẩu thành công' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    const meta = {
      ip: req.ip || req.headers?.['x-forwarded-for'] || null,
      userAgent: req.headers?.['user-agent'] || null,
    };
    await this.authService.logout(req.user.userId, meta);
    return { message: 'Đăng xuất thành công' };
  }
}

