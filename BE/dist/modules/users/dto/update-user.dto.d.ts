import { RoleName } from '../../../common/enums/role.enum';
export declare class UpdateUserDto {
    fullName?: string;
    role?: RoleName;
    nodeId?: string | null;
    isActive?: boolean;
}
