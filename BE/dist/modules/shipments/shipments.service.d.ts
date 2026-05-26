import { DataSource } from 'typeorm';
import { ShipmentEntity } from './entities/shipment.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
export declare class ShipmentsService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    findAll(query: any, currentUser: any): Promise<{
        data: ShipmentEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, currentUser: any): Promise<any>;
    createTransfer(createShipmentDto: CreateShipmentDto, currentUser: any): Promise<ShipmentEntity>;
    receiveShipment(id: string, currentUser: any): Promise<ShipmentEntity>;
}
