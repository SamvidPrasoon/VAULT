import { api } from './client';
import type { Secret, CreateSecretRequest, UpdateSecretRequest } from './types';

export const secretsApi = {
  getAll: async (): Promise<{ secrets: Secret[] }> => {
    const response = await api.get('/secrets');
    return response.data;
  },

  getAwsSecrets: async (): Promise<{ awsSecrets: { Name?: string; ARN: string }[] }> => {
    const response = await api.get('/secrets/aws');
    return response.data;
  },

  getById: async (id: number): Promise<{ secret: Secret }> => {
    const response = await api.get(`/secrets/${id}`);
    return response.data;
  },

  create: async (data: CreateSecretRequest): Promise<{ secret: Secret }> => {
    const response = await api.post('/secrets', data);
    return response.data;
  },

  update: async (id: number, data: UpdateSecretRequest): Promise<{ secret: Secret }> => {
    const response = await api.put(`/secrets/${id}`, data);
    return response.data;
  },

  rotate: async (id: number): Promise<{ message: string; newValue: string }> => {
    const response = await api.post(`/secrets/${id}/rotate`);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/secrets/${id}`);
    return response.data;
  },
};
