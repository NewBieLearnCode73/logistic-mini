import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
    }>;
    getMe(req: {
        user: {
            userId: string;
            role: string;
            nodeId: string | null;
        };
    }): Promise<{
        id: string;
        email: string;
        fullName: string;
        nodeId: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        version: number;
        userRoles: import("../users/entities/user-role.entity").UserRoleEntity[];
    } | null>;
    changePassword(req: {
        user: {
            userId: string;
        };
    }, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    logout(): Promise<{
        message: string;
    }>;
}
