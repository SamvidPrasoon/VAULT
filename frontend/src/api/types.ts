export interface User {
  id: number;
  email: string;
  role: string;
}

export interface Secret {
  id: number;
  name: string;
  description: string | null;
  aws_secret_id: string;
  created_at: string;
  updated_at: string;
  value?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: string;
}

export interface CreateSecretRequest {
  name: string;
  value: string;
  description?: string;
}

export interface UpdateSecretRequest {
  value?: string;
  description?: string;
}
