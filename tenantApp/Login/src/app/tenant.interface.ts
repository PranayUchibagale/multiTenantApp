export interface Customer {
  id?: number;          // Server-assigned ID (after sync)
  localId?: number;     // Client-generated temporary ID
  name: string;
  email: string;
  phone?: string;
  isSynced?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}