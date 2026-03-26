import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecipients, createRecipient } from '../api/recipients';

export function useRecipients() {
  return useQuery({
    queryKey: ['recipients'],
    queryFn: getRecipients,
  });
}

export function useCreateRecipient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, name }: { email: string; name: string }) => createRecipient(email, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipients'] });
    },
  });
}
