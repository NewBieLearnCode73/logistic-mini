import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        message: string;
        data: import("./entities/user.entity").UserEntity;
        temporaryPassword: string;
    }>;
    findAll(page?: string, limit?: string, role?: string, nodeId?: string, isActive?: string): Promise<{
        data: import("./entities/user.entity").UserEntity[];
        total: number;
        page: number;
        limit: number;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        message: string;
        data: import("./entities/user.entity").UserEntity;
    }>;
    toggleActive(id: string): Promise<{
        message: string;
        data: import("./entities/user.entity").UserEntity;
    }>;
    resetPassword(id: string): Promise<{
        message: string;
        data: import("./entities/user.entity").UserEntity;
        temporaryPassword: string;
    }>;
}
