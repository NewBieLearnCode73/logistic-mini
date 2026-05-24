import { UserRoleEntity } from '../../users/entities/user-role.entity';
export declare class RoleEntity {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    userRoles: UserRoleEntity[];
}
