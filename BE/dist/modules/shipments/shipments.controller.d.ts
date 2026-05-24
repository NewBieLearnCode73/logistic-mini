import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ShipmentEntity } from './entities/shipment.entity';
export declare class ShipmentsController {
    private readonly shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    create(createShipmentDto: CreateShipmentDto, req: any): Promise<ShipmentEntity>;
    findAll(query: {
        page?: string;
        limit?: string;
    }, req: any): Promise<{
        data: ShipmentEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, req: any): Promise<any>;
    receive(id: string, req: any): Promise<ShipmentEntity>;
}
