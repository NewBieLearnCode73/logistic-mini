import { NodeType } from '../../../common/enums/node-type.enum';
export declare class NodeEntity {
    id: string;
    name: string;
    nodeType: NodeType;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    version: number;
}
