import { NodeType } from '../utils/constants';

export interface Node {
  id: string;
  name: string;
  nodeType: NodeType;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
}

export interface CreateNodeDto {
  name: string;
  nodeType: NodeType;
  address?: string;
  latitude: number;
  longitude: number;
}

export interface UpdateNodeDto {
  name?: string;
  nodeType?: NodeType;
  address?: string;
  latitude?: number;
  longitude?: number;
  version: number; // For optimistic locking
}
