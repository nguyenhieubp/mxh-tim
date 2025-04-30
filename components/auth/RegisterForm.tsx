import { useState } from "react";
import { useAppDispatch } from "@/redux/configs/hooks";
import { register } from "@/redux/features/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AlertSnackbar from "../common/AlertSnackbar";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { validateEmail } from "@/services/emailValidation";

const RegisterForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "email") {
      setEmailError("");
    }
  };

  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra định dạng email cơ bản
    if (!validateEmailFormat(formData.email)) {
      setEmailError("Email không hợp lệ");
      return;
    }

    try {
      setIsValidating(true);
      // Kiểm tra email thực
      
      // const isValid = await validateEmail(formData.email);
      // if (!isValid) {
      //   setEmailError("Email không tồn tại hoặc không hợp lệ");
      //   setIsValidating(false);
      //   return;
      // }

      await dispatch(register(formData)).unwrap();
      setAlert({
        open: true,
        message: "Đăng ký thành công! Đang chuyển hướng...",
        severity: "success",
      });
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      setAlert({
        open: true,
        message: "Đăng ký thất bại. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setIsValidating(false);
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
            <p className="mt-2 text-gray-600">Tạo tài khoản mới</p>
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
                  className={`w-full px-4 py-3 rounded-xl border ${
                    emailError ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50`}
                  required
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="Tên người dùng"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50"
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50"
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
            </div>

            <button
              type="submit"
              disabled={!formData.email || !formData.username || !formData.password || isValidating}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isValidating ? "Đang kiểm tra email..." : "Đăng ký"}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500">
            Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <p className="text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-blue-500 font-semibold hover:text-blue-600 transition-colors"
            >
              Đăng nhập
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

export default RegisterForm;
