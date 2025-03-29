import axios from "axios";
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  MeResponse,
} from "./types";
import { getAuthHeaders } from "@/utils/api";

const USER_API_URL = "http://localhost:8080/api/v1/user";
const AUTH_API_URL = "http://localhost:8080/api/v1/auth";
const TOKEN_KEY = "token";

export const authService = {
  register: async (registerData: RegisterRequest) => {
    const response = await axios.post<RegisterResponse>(
      `${USER_API_URL}/register`,
      registerData
    );
    return response.data;
  },

  login: async (loginData: LoginRequest) => {
    const response = await axios.post<LoginResponse>(
      `${AUTH_API_URL}/login`,
      loginData
    );
    if (response.data.data.accessToken) {
      localStorage.setItem(TOKEN_KEY, response.data.data.accessToken);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get<MeResponse>(
      `${AUTH_API_URL}/me`,
      getAuthHeaders()
    );
    return response.data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
};
