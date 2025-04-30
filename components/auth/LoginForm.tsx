import { useState } from "react";
import { useAppDispatch } from "@/redux/configs/hooks";
import { login, getCurrentUser } from "@/redux/features/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AlertSnackbar from "../common/AlertSnackbar";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Đăng nhập
      await dispatch(login(formData)).unwrap();
      
      // Lấy thông tin user hiện tại
      const userResult = await dispatch(getCurrentUser()).unwrap();
      const userData = userResult?.data;
      
      // Kiểm tra role USER
      const hasUserRole = userData?.roles?.some(
        (role: string) => role.toLowerCase() === "user"
      );

      if (!hasUserRole) {
        setError("Email hoặc mật khẩu không đúng");
        setAlert({
          open: true,
          message: "Email hoặc mật khẩu không đúng",
          severity: "error",
        });
        localStorage.removeItem("token");
        return;
      }

      setError("");
      setAlert({
        open: true,
        message: "Đăng nhập thành công! Đang chuyển hướng...",
        severity: "success",
      });
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setError("Email hoặc mật khẩu không đúng");
        setAlert({
          open: true,
          message: "Email hoặc mật khẩu không đúng",
          severity: "error",
        });
      } else if (error?.response?.status === 404) {
        setError("Không tìm thấy email");
        setAlert({
          open: true,
          message: "Không tìm thấy email",
          severity: "error",
        });
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
        setAlert({
          open: true,
          message: "Có lỗi xảy ra. Vui lòng thử lại.",
          severity: "error",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SocialVerse
            </h1>
            <p className="mt-2 text-gray-600">Đăng nhập vào tài khoản của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${error ? "border-red-500" : "border-gray-200"
                    } focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50`}
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border ${error ? "border-red-500" : "border-gray-200"
                    } focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50`}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <VisibilityOff className="h-5 w-5" />
                  ) : (
                    <Visibility className="h-5 w-5" />
                  )}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!formData.email || !formData.password}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Đăng nhập
            </button>
          </form>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-500 font-semibold hover:text-blue-600 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-blue-500 font-semibold hover:text-blue-600 transition-colors"
            >
              Đăng ký
            </Link>
          </p>
        </div>
      </div>

      <AlertSnackbar
        open={alert.open}
        onClose={handleCloseAlert}
        message={alert.message}
        severity={alert.severity}
      />
    </div>
  );
};

export default LoginForm;
