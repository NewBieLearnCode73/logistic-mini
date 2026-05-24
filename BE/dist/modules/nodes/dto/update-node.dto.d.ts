import { NodeType } from '../../../common/enums/node-type.enum';
export declare class UpdateNodeDto {
    name?: string;
    nodeType?: NodeType;
    address?: string;
    latitude?: number;
    longitude?: number;
    version?: number;
}
