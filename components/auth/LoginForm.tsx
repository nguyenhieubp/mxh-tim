import { useState } from "react";
import { useAppDispatch } from "@/redux/configs/hooks";
import { login } from "@/redux/features/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AlertSnackbar from "../common/AlertSnackbar";

const LoginForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      setError("");
      setAlert({
        open: true,
        message: "Login successful! Redirecting...",
        severity: "success",
      });
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setError("Email or password is incorrect");
      } else if (error?.response?.status === 404) {
        setError("Email not found");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-50 to-pink-50">
      <AlertSnackbar
        open={alert.open}
        onClose={handleCloseAlert}
        message={alert.message}
        severity={alert.severity}
      />
      <div className="max-w-md w-full space-y-4 p-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6 border border-gray-100">
          <div className="flex justify-center">
            <h1 className="text-3xl cursor-pointer font-bold mb-8 px-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-pink-600 hover:to-purple-600 transition-all duration-300">
              Socialverse
            </h1>
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
                  className={`w-full px-4 py-3 rounded-lg border ${
                    error ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors bg-gray-50`}
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    error ? "border-red-500" : "border-gray-200"
                  } focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors bg-gray-50`}
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!formData.email || !formData.password}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Log In
            </button>
          </form>

          <div className="flex items-center justify-center space-x-2">
            <span className="w-24 h-px bg-gray-200"></span>
            <span className="text-gray-400 font-medium">or</span>
            <span className="w-24 h-px bg-gray-200"></span>
          </div>

          <div className="text-center">
            <Link
              href="#"
              className="text-sm text-blue-900 font-semibold hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <p className="text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-500 font-semibold hover:text-blue-600 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
