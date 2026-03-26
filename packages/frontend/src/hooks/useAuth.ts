import { useMutation } from '@tanstack/react-query';
import { loginApi, registerApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '../App';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi(email, password),
    onSuccess: (data) => {
      queryClient.clear();
      setAuth(data.token, data.user);
      navigate('/campaigns');
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, name, password }: { email: string; name: string; password: string }) =>
      registerApi(email, name, password),
    onSuccess: (data) => {
      queryClient.clear();
      setAuth(data.token, data.user);
      navigate('/campaigns');
    },
  });
}
