import { Repository } from 'typeorm';
import { NodeEntity } from './entities/node.entity';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { InventoryEntity } from '../batches/entities/inventory.entity';
export declare class NodesService {
    private readonly nodeRepository;
    private readonly inventoryRepository;
    constructor(nodeRepository: Repository<NodeEntity>, inventoryRepository: Repository<InventoryEntity>);
    create(createNodeDto: CreateNodeDto): Promise<NodeEntity>;
    findAll(options: {
        page?: number;
        limit?: number;
        includeInventory?: boolean;
        isActive?: boolean | 'all';
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(id: string): Promise<NodeEntity>;
    findDetails(id: string): Promise<any>;
    update(id: string, updateNodeDto: UpdateNodeDto): Promise<NodeEntity>;
    delete(id: string): Promise<void>;
}
