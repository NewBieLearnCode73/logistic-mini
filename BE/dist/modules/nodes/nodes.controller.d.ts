import { NodesService } from './nodes.service';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { NodeEntity } from './entities/node.entity';
export declare class NodesController {
    private readonly nodesService;
    constructor(nodesService: NodesService);
    create(createNodeDto: CreateNodeDto): Promise<NodeEntity>;
    findAll(page?: string, limit?: string, includeInventory?: string, isActive?: string): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateNodeDto: UpdateNodeDto): Promise<NodeEntity>;
    delete(id: string): Promise<void>;
}
