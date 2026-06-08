import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { NodeEntity } from '../nodes/entities/node.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleEntity } from './entities/user-role.entity';
import { UserEntity } from './entities/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(NodeEntity)
    private readonly nodeRepository: Repository<NodeEntity>,
    private readonly mailService: MailService,
  ) { }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const formattedEmail = email.trim().toLowerCase();
    return this.userRepository.findOne({
      where: { email: formattedEmail, isActive: true },
      relations: { userRoles: { role: true } },
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id, isActive: true },
      relations: { userRoles: { role: true } },
    });
  }

  async findAdminDetail(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<{ user: UserEntity; temporaryPassword: string }> {
    const { email, fullName, role, nodeId } = createUserDto;
    const formattedEmail = email.trim().toLowerCase();

    // Check email uniqueness
    const existingUser = await this.userRepository.findOne({
      where: { email: formattedEmail },
    });
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    // Verify role existence
    const roleEntity = await this.roleRepository.findOne({
      where: { name: role },
    });
    if (!roleEntity) {
      throw new NotFoundException(`Vai trò ${role} không tồn tại`);
    }

    // Verify node existence if nodeId is provided
    if (nodeId) {
      const node = await this.nodeRepository.findOne({
        where: { id: nodeId, isActive: true },
      });
      if (!node) {
        throw new NotFoundException(`Node với ID ${nodeId} không tồn tại hoặc đã bị khóa`);
      }
    }

    // Generate temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    // Save user
    const user = new UserEntity();
    user.email = formattedEmail;
    user.fullName = fullName;
    user.passwordHash = passwordHash;
    user.nodeId = nodeId || null;
    user.isActive = true;

    const savedUser = await this.userRepository.save(user);

    // Create role mapping
    const userRole = new UserRoleEntity();
    userRole.userId = savedUser.id;
    userRole.roleId = roleEntity.id;
    await this.userRoleRepository.save(userRole);

    // Send actual email using Brevo
    await this.mailService.sendTemporaryPassword(savedUser.email, temporaryPassword);

    // Log simulated email activation for records
    console.log(`[EMAIL DISPATCHED] Gửi email kích hoạt mật khẩu tới ${savedUser.email}`);
    console.log(`[EMAIL DISPATCHED] Mật khẩu tạm thời: ${temporaryPassword}`);

    // Load roles to return
    savedUser.userRoles = [userRole];
    userRole.role = roleEntity;

    return {
      user: savedUser,
      temporaryPassword,
    };
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    role?: string;
    nodeId?: string;
    isActive?: boolean;
  }): Promise<{ data: UserEntity[]; total: number; page: number; limit: number }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role');

    if (query.role) {
      queryBuilder.andWhere('role.name = :role', { role: query.role });
    }

    if (query.nodeId) {
      queryBuilder.andWhere('user.nodeId = :nodeId', { nodeId: query.nodeId });
    }

    if (query.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: query.isActive });
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    // Sanitize passwords out
    data.forEach((u) => {
      delete (u as any).passwordHash;
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findAdminDetail(id);
    if (!user) {
      throw new NotFoundException(`Tài khoản với ID ${id} không tồn tại`);
    }

    const { fullName, role, nodeId, isActive } = updateUserDto;

    if (fullName !== undefined) {
      user.fullName = fullName;
    }

    if (nodeId !== undefined) {
      if (nodeId) {
        const node = await this.nodeRepository.findOne({
          where: { id: nodeId, isActive: true },
        });
        if (!node) {
          throw new NotFoundException(`Node với ID ${nodeId} không tồn tại hoặc đã bị khóa`);
        }
      }
      user.nodeId = nodeId;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    if (role !== undefined) {
      const roleEntity = await this.roleRepository.findOne({
        where: { name: role },
      });
      if (!roleEntity) {
        throw new NotFoundException(`Vai trò ${role} không tồn tại`);
      }

      // Delete old roles mapping
      await this.userRoleRepository.delete({ userId: id });

      // Create new role mapping
      const userRole = new UserRoleEntity();
      userRole.userId = id;
      userRole.roleId = roleEntity.id;
      await this.userRoleRepository.save(userRole);
    }

    const updatedUser = await this.userRepository.save(user);

    // Reload full relations
    const result = await this.findAdminDetail(updatedUser.id);
    if (result) {
      delete (result as any).passwordHash;
    }
    return result!;
  }

  async toggleActive(id: string): Promise<UserEntity> {
    const user = await this.findAdminDetail(id);
    if (!user) {
      throw new NotFoundException(`Tài khoản với ID ${id} không tồn tại`);
    }

    user.isActive = !user.isActive;
    const updatedUser = await this.userRepository.save(user);

    const result = await this.findAdminDetail(updatedUser.id);
    if (result) {
      delete (result as any).passwordHash;
    }
    return result!;
  }

  async resetPassword(id: string): Promise<{ user: UserEntity; temporaryPassword: string }> {
    const user = await this.findAdminDetail(id);
    if (!user) {
      throw new NotFoundException(`Tài khoản với ID ${id} không tồn tại`);
    }

    // Check if the user is an Admin
    const isAdmin = user.userRoles?.some((ur) => ur.role?.name === 'Admin');
    if (isAdmin) {
      throw new BadRequestException('Không thể cấp lại mật khẩu cho tài khoản có quyền Admin');
    }

    // Generate temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    user.passwordHash = passwordHash;
    const savedUser = await this.userRepository.save(user);

    // Send actual email using Brevo
    await this.mailService.sendTemporaryPassword(savedUser.email, temporaryPassword);

    // Log simulated email activation
    console.log(`[EMAIL SIMULATION] Gửi email cấp lại mật khẩu tới ${savedUser.email}`);
    console.log(`[EMAIL SIMULATION] Mật khẩu mới: ${temporaryPassword}`);

    // Exclude passwordHash from user object before returning
    delete (savedUser as any).passwordHash;

    return {
      user: savedUser,
      temporaryPassword,
    };
  }

  async changePassword(id: string, changePasswordDto: any): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại hoặc đã bị khóa');
    }

    const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không chính xác');
    }

    user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);
    await this.userRepository.save(user);
  }
}

