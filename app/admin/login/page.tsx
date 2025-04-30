"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/configs/hooks";
import { login as loginAction, getCurrentUser } from "@/redux/features/auth";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Nếu đã đăng nhập và là admin, chuyển hướng về trang admin
  if (user && !isLoading) {
    const isAdmin = user.roles?.some(
      (role: string) => role.toLowerCase() === "admin"
    );
    if (isAdmin) {
      router.push("/admin");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Đăng nhập
      await dispatch(loginAction({ email, password })).unwrap();
      
      // Lấy thông tin user hiện tại
      const userResult = await dispatch(getCurrentUser()).unwrap();
      const userData = userResult?.data;
      
      // Kiểm tra role ADMIN
      const isAdmin = userData?.roles?.some(
        (role: string) => role.toLowerCase() === "admin"
      );

      if (!isAdmin) {
        setError("Bạn không có quyền truy cập trang admin");
        localStorage.removeItem("token");
        return;
      }

      router.push("/admin");
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Email hoặc mật khẩu không đúng");
      } else if (err?.response?.status === 404) {
        setError("Không tìm thấy email");
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Admin Login
        </Typography>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={!!error}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={!!error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 2 }}
          >
            Sign in
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
