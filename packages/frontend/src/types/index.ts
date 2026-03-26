export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Campaign {
  id: number;
  name: string;
  subject: string;
  body: string;
  status: 'draft' | 'sending' | 'scheduled' | 'sent';
  scheduledAt: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  recipients?: RecipientWithStatus[];
  stats?: Stats;
}

export interface Recipient {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

export interface RecipientWithStatus {
  id: number;
  email: string;
  name: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt: string | null;
  openedAt: string | null;
}

export interface Stats {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
}

export interface PaginatedResponse<T> {
  campaigns: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}
