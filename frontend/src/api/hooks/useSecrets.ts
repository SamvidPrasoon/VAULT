import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { secretsApi } from '../secrets';
import type { CreateSecretRequest, UpdateSecretRequest } from '../types';

export const useSecrets = () => {
  return useQuery({
    queryKey: ['secrets'],
    queryFn: () => secretsApi.getAll(),
  });
};

export const useAwsSecrets = () => {
  return useQuery({
    queryKey: ['awsSecrets'],
    queryFn: () => secretsApi.getAwsSecrets(),
  });
};

export const useSecret = (id: number) => {
  return useQuery({
    queryKey: ['secret', id],
    queryFn: () => secretsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSecretRequest) => secretsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
    },
  });
};

export const useUpdateSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSecretRequest }) =>
      secretsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
      queryClient.invalidateQueries({ queryKey: ['secret', id] });
    },
  });
};

export const useRotateSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => secretsApi.rotate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
    },
  });
};

export const useDeleteSecret = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => secretsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secrets'] });
    },
  });
};
