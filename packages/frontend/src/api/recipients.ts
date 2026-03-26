import apiClient from './client';
import type { Recipient } from '../types';

export async function getRecipients() {
  const { data } = await apiClient.get<{ recipients: Recipient[] }>('/recipients');
  return data.recipients;
}

export async function createRecipient(email: string, name: string) {
  const { data } = await apiClient.post<{ recipient: Recipient }>('/recipient', { email, name });
  return data.recipient;
}
