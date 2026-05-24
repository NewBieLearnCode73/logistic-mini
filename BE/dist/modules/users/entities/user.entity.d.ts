import { UserRoleEntity } from './user-role.entity';
export declare class UserEntity {
    id: string;
    email: string;
    passwordHash: string;
    fullName: string;
    nodeId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    version: number;
    userRoles: UserRoleEntity[];
}
