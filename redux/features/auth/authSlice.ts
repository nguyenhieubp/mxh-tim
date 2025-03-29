import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthState, RegisterRequest, LoginRequest } from "./types";
import { authService } from "./authService";

const initialState: AuthState = {
  loading: false,
  error: null,
  success: false,
  message: null,
  user: null,
};

export const register = createAsyncThunk(
  "auth/register",
  async (registerData: RegisterRequest) => {
    return await authService.register(registerData);
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (loginData: LoginRequest) => {
    return await authService.login(loginData);
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async () => {
    return await authService.getCurrentUser();
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.data;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.error.message || "Registration failed";
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;

        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.error.message || "Login failed";
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.data;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.error.message || "Failed to fetch user data";
        state.user = null;
      });
  },
});

export const { clearState, logout } = authSlice.actions;
export default authSlice.reducer;
