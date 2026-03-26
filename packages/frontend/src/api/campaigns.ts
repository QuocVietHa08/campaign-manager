import apiClient from './client';
import type { Campaign, PaginatedResponse } from '../types';

export async function getCampaigns(page: number = 1, limit: number = 10) {
  const { data } = await apiClient.get<PaginatedResponse<Campaign>>('/campaigns', {
    params: { page, limit },
  });
  return data;
}

export async function getCampaign(id: number) {
  const { data } = await apiClient.get<{ campaign: Campaign }>(`/campaigns/${id}`);
  return data.campaign;
}

export async function createCampaign(payload: {
  name: string;
  subject: string;
  body: string;
  recipientIds?: number[];
}) {
  const { data } = await apiClient.post<{ campaign: Campaign }>('/campaigns', payload);
  return data.campaign;
}

export async function updateCampaign(
  id: number,
  payload: { name?: string; subject?: string; body?: string; recipientIds?: number[] }
) {
  const { data } = await apiClient.patch<{ campaign: Campaign }>(`/campaigns/${id}`, payload);
  return data.campaign;
}

export async function deleteCampaign(id: number) {
  await apiClient.delete(`/campaigns/${id}`);
}

export async function scheduleCampaign(id: number, scheduledAt: string) {
  const { data } = await apiClient.post<{ campaign: Campaign }>(`/campaigns/${id}/schedule`, {
    scheduledAt,
  });
  return data.campaign;
}

export async function sendCampaign(id: number) {
  const { data } = await apiClient.post<{ campaign: Campaign }>(`/campaigns/${id}/send`);
  return data.campaign;
}
