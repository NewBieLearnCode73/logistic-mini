import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserEntity } from '../users/entities/user.entity';
import { AuditLogEntity } from '../audit/entities/audit-log.entity';

// N-02: In-memory store cho failed login attempts
// key = email.toLowerCase(), value = { count, lockUntil }
const loginAttempts = new Map<string, { count: number; lockUntil: Date | null }>();
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 phút

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  private getAttemptRecord(email: string) {
    const key = email.trim().toLowerCase();
    if (!loginAttempts.has(key)) {
      loginAttempts.set(key, { count: 0, lockUntil: null });
    }
    return loginAttempts.get(key)!;
  }

  private resetAttempts(email: string) {
    loginAttempts.delete(email.trim().toLowerCase());
  }

  private async writeAuditLog(opts: {
    actorId: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    try {
      const log = new AuditLogEntity();
      log.actorId = opts.actorId;
      log.action = opts.action;
      log.entityType = opts.entityType;
      log.entityId = opts.entityId;
      log.oldValues = opts.oldValues ?? null;
      log.newValues = opts.newValues ?? null;
      log.ipAddress = opts.ipAddress ?? null;
      log.userAgent = opts.userAgent ?? null;
      await this.dataSource.getRepository(AuditLogEntity).save(log);
    } catch {
      // Không để lỗi audit làm hỏng luồng chính
    }
  }

  async validateUser(email: string, pass: string): Promise<UserEntity> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    return user;
  }

  async login(loginDto: LoginDto, meta?: { ip?: string; userAgent?: string }): Promise<{ accessToken: string }> {
    const emailKey = loginDto.email.trim().toLowerCase();
    const record = this.getAttemptRecord(emailKey);

    // N-02: Kiểm tra lock
    if (record.lockUntil && record.lockUntil > new Date()) {
      const remainingMs = record.lockUntil.getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      throw new UnauthorizedException(
        `Tài khoản bị khóa tạm thời do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${remainingMin} phút.`,
      );
    }

    let user: UserEntity;
    try {
      user = await this.validateUser(loginDto.email, loginDto.password);
    } catch (err) {
      // N-02: Tăng counter khi sai
      record.count += 1;
      if (record.count >= MAX_ATTEMPTS) {
        record.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        // N-01: Ghi audit_log LOGIN_FAILED + ACCOUNT_LOCKED
        await this.writeAuditLog({
          actorId: null,
          action: 'LOGIN_FAILED_LOCKED',
          entityType: 'users',
          entityId: null,
          newValues: { email: emailKey, attempts: record.count, lockedUntil: record.lockUntil },
          ipAddress: meta?.ip,
          userAgent: meta?.userAgent,
        });
      } else {
        // N-01: Ghi audit_log LOGIN_FAILED
        await this.writeAuditLog({
          actorId: null,
          action: 'LOGIN_FAILED',
          entityType: 'users',
          entityId: null,
          newValues: { email: emailKey, attempts: record.count, remainingAttempts: MAX_ATTEMPTS - record.count },
          ipAddress: meta?.ip,
          userAgent: meta?.userAgent,
        });
      }
      throw err;
    }

    // Đăng nhập thành công → reset failed attempts
    this.resetAttempts(emailKey);

    const primaryRole = user.userRoles && user.userRoles.length > 0
      ? user.userRoles[0].role.name
      : 'Consumer';

    const payload: JwtPayload = {
      sub: user.id,
      role: primaryRole,
      nodeId: user.nodeId,
    };

    const accessToken = this.jwtService.sign(payload);

    // N-01: Ghi audit_log LOGIN thành công
    await this.writeAuditLog({
      actorId: user.id,
      action: 'LOGIN',
      entityType: 'users',
      entityId: user.id,
      newValues: { role: primaryRole, nodeId: user.nodeId },
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });

    return { accessToken };
  }

  async logout(userId: string, meta?: { ip?: string; userAgent?: string }): Promise<void> {
    // N-01: Ghi audit_log LOGOUT
    await this.writeAuditLog({
      actorId: userId,
      action: 'LOGOUT',
      entityType: 'users',
      entityId: userId,
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });
  }
}
