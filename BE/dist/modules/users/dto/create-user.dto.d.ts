import { RoleName } from '../../../common/enums/role.enum';
export declare class CreateUserDto {
    email: string;
    fullName: string;
    role: RoleName;
    nodeId?: string | null;
}
