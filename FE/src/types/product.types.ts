export interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  unit: string;
  description?: string;
  category?: string;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  unit?: string;
  description?: string;
  category?: string;
}
