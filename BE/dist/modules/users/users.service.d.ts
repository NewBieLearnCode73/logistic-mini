import { Repository } from 'typeorm';
import { NodeEntity } from '../nodes/entities/node.entity';
import { RoleEntity } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRoleEntity } from './entities/user-role.entity';
import { UserEntity } from './entities/user.entity';
export declare class UsersService {
    private readonly userRepository;
    private readonly userRoleRepository;
    private readonly roleRepository;
    private readonly nodeRepository;
    constructor(userRepository: Repository<UserEntity>, userRoleRepository: Repository<UserRoleEntity>, roleRepository: Repository<RoleEntity>, nodeRepository: Repository<NodeEntity>);
    findByEmail(email: string): Promise<UserEntity | null>;
    findById(id: string): Promise<UserEntity | null>;
    findAdminDetail(id: string): Promise<UserEntity | null>;
    create(createUserDto: CreateUserDto): Promise<{
        user: UserEntity;
        temporaryPassword: string;
    }>;
    findAll(query: {
        page?: number;
        limit?: number;
        role?: string;
        nodeId?: string;
        isActive?: boolean;
    }): Promise<{
        data: UserEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity>;
    toggleActive(id: string): Promise<UserEntity>;
    resetPassword(id: string): Promise<{
        user: UserEntity;
        temporaryPassword: string;
    }>;
}
