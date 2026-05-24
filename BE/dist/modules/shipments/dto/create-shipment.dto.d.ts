export declare class CreateShipmentDto {
    batchId: string;
    sourceNodeId?: string;
    destinationNodeId: string;
    quantityShipped: number;
    notes?: string;
    expectedDeliveryDate?: string;
}
