import { UserEntity } from './user.entity';
import { RoleEntity } from '../../roles/entities/role.entity';
export declare class UserRoleEntity {
    userId: string;
    roleId: string;
    assignedAt: Date;
    user: UserEntity;
    role: RoleEntity;
}
