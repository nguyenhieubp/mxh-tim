export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  status: number;
  message: string;
  data: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenData {
  accessToken: string;
  tokenType: string;
}

export interface LoginResponse {
  status: number;
  message: string;
  data: TokenData;
}

export interface UserData {
  userId: string;
  username: string;
  roles: string[];
}

export interface MeResponse {
  status: number;
  message: string;
  data: UserData;
}

export interface AuthState {
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
  user: UserData | null;
}
