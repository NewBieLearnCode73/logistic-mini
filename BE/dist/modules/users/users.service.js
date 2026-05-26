"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_2 = require("typeorm");
const node_entity_1 = require("../nodes/entities/node.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const user_role_entity_1 = require("./entities/user-role.entity");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    userRepository;
    userRoleRepository;
    roleRepository;
    nodeRepository;
    constructor(userRepository, userRoleRepository, roleRepository, nodeRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.nodeRepository = nodeRepository;
    }
    async findByEmail(email) {
        const formattedEmail = email.trim().toLowerCase();
        return this.userRepository.findOne({
            where: { email: formattedEmail, isActive: true },
            relations: { userRoles: { role: true } },
        });
    }
    async findById(id) {
        return this.userRepository.findOne({
            where: { id, isActive: true },
            relations: { userRoles: { role: true } },
        });
    }
    async findAdminDetail(id) {
        return this.userRepository.findOne({
            where: { id },
            relations: { userRoles: { role: true } },
        });
    }
    async create(createUserDto) {
        const { email, fullName, role, nodeId } = createUserDto;
        const formattedEmail = email.trim().toLowerCase();
        const existingUser = await this.userRepository.findOne({
            where: { email: formattedEmail },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email đã tồn tại trong hệ thống');
        }
        const roleEntity = await this.roleRepository.findOne({
            where: { name: role },
        });
        if (!roleEntity) {
            throw new common_1.NotFoundException(`Vai trò ${role} không tồn tại`);
        }
        if (nodeId) {
            const node = await this.nodeRepository.findOne({
                where: { id: nodeId, isActive: true },
            });
            if (!node) {
                throw new common_1.NotFoundException(`Node với ID ${nodeId} không tồn tại hoặc đã bị khóa`);
            }
        }
        const temporaryPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(temporaryPassword, 12);
        const user = new user_entity_1.UserEntity();
        user.email = formattedEmail;
        user.fullName = fullName;
        user.passwordHash = passwordHash;
        user.nodeId = nodeId || null;
        user.isActive = true;
        const savedUser = await this.userRepository.save(user);
        const userRole = new user_role_entity_1.UserRoleEntity();
        userRole.userId = savedUser.id;
        userRole.roleId = roleEntity.id;
        await this.userRoleRepository.save(userRole);
        console.log(`[EMAIL SIMULATION] Gửi email kích hoạt mật khẩu tới ${savedUser.email}`);
        console.log(`[EMAIL SIMULATION] Mật khẩu tạm thời: ${temporaryPassword}`);
        savedUser.userRoles = [userRole];
        userRole.role = roleEntity;
        return {
            user: savedUser,
            temporaryPassword,
        };
    }
    async findAll(query) {
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
        data.forEach((u) => {
            delete u.passwordHash;
        });
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async update(id, updateUserDto) {
        const user = await this.findAdminDetail(id);
        if (!user) {
            throw new common_1.NotFoundException(`Tài khoản với ID ${id} không tồn tại`);
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
                    throw new common_1.NotFoundException(`Node với ID ${nodeId} không tồn tại hoặc đã bị khóa`);
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
                throw new common_1.NotFoundException(`Vai trò ${role} không tồn tại`);
            }
            await this.userRoleRepository.delete({ userId: id });
            const userRole = new user_role_entity_1.UserRoleEntity();
            userRole.userId = id;
            userRole.roleId = roleEntity.id;
            await this.userRoleRepository.save(userRole);
        }
        const updatedUser = await this.userRepository.save(user);
        const result = await this.findAdminDetail(updatedUser.id);
        if (result) {
            delete result.passwordHash;
        }
        return result;
    }
    async toggleActive(id) {
        const user = await this.findAdminDetail(id);
        if (!user) {
            throw new common_1.NotFoundException(`Tài khoản với ID ${id} không tồn tại`);
        }
        user.isActive = !user.isActive;
        const updatedUser = await this.userRepository.save(user);
        const result = await this.findAdminDetail(updatedUser.id);
        if (result) {
            delete result.passwordHash;
        }
        return result;
    }
    async resetPassword(id) {
        const user = await this.findAdminDetail(id);
        if (!user) {
            throw new common_1.NotFoundException(`Tài khoản với ID ${id} không tồn tại`);
        }
        const isAdmin = user.userRoles?.some((ur) => ur.role?.name === 'Admin');
        if (isAdmin) {
            throw new common_1.BadRequestException('Không thể cấp lại mật khẩu cho tài khoản có quyền Admin');
        }
        const temporaryPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(temporaryPassword, 12);
        user.passwordHash = passwordHash;
        const savedUser = await this.userRepository.save(user);
        console.log(`[EMAIL SIMULATION] Gửi email cấp lại mật khẩu tới ${savedUser.email}`);
        console.log(`[EMAIL SIMULATION] Mật khẩu mới: ${temporaryPassword}`);
        delete savedUser.passwordHash;
        return {
            user: savedUser,
            temporaryPassword,
        };
    }
    async changePassword(id, changePasswordDto) {
        const user = await this.userRepository.findOne({
            where: { id, isActive: true },
        });
        if (!user) {
            throw new common_1.NotFoundException('Tài khoản không tồn tại hoặc đã bị khóa');
        }
        const isMatch = await bcrypt.compare(changePasswordDto.oldPassword, user.passwordHash);
        if (!isMatch) {
            throw new common_1.BadRequestException('Mật khẩu cũ không chính xác');
        }
        user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);
        await this.userRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_role_entity_1.UserRoleEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(role_entity_1.RoleEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(node_entity_1.NodeEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map