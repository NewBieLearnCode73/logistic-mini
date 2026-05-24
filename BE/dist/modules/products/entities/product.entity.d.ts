export declare class ProductEntity {
    id: string;
    name: string;
    sku: string;
    unit: string;
    description: string | null;
    category: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}
