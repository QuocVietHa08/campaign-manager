import apiClient from './client';
import type { AuthResponse } from '../types';

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
}

export async function registerApi(
  email: string,
  name: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await apiClient.post('/auth/register', { email, name, password });
  return data;
}
