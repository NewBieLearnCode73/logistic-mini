export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  role: {
    id: string;
    name: string;
    description?: string;
    createdAt?: string;
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  nodeId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  version: number;
  userRoles: UserRole[];
}

export interface CreateUserDto {
  email: string;
  fullName: string;
  role: string;
  nodeId?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  role?: string;
  nodeId?: string | null;
}
