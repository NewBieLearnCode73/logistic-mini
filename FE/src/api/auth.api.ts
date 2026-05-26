import api from './axios';
import type { LoginDto, LoginResponse, User } from '../types/auth.types';

export const authApi = {
  login: (data: LoginDto) =>
    api.post<LoginResponse>('/auth/login', data),

  me: () =>
    api.get<User>('/auth/me'),

  logout: () =>
    api.post('/auth/logout'),

  changePassword: (data: any) =>
    api.post<{ message: string }>('/auth/change-password', data),
};

