import { NodeType } from '../../../common/enums/node-type.enum';
export declare class CreateNodeDto {
    name: string;
    nodeType: NodeType;
    address?: string;
    latitude: number;
    longitude: number;
}
