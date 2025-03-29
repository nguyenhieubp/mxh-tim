import { useState } from "react";
import { useAppDispatch } from "@/redux/configs/hooks";
import { register } from "@/redux/features/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const RegisterForm = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log(formData);
      const response = await dispatch(register(formData)).unwrap();
      console.log(response);
      router.push("/login");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="max-w-md w-full space-y-4 p-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6 border border-gray-100">
          <div className="flex justify-center">
            <h1 className="text-3xl  cursor-pointer font-bold mb-8 px-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-pink-600 hover:to-purple-600 transition-all duration-300">
              Socialverse
            </h1>
          </div>

          <h2 className="text-center text-xl font-semibold text-gray-600">
            Sign up to see photos and videos
          </h2>

          <div className="flex items-center justify-center space-x-2">
            <span className="w-24 h-px bg-gray-200"></span>
            <span className="text-gray-400 font-medium">or</span>
            <span className="w-24 h-px bg-gray-200"></span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors bg-gray-50"
              />

              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors bg-gray-50"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors bg-gray-50"
              />
            </div>

            <button
              type="submit"
              disabled={
                !formData.email || !formData.username || !formData.password
              }
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 px-8">
            By signing up, you agree to our Terms, Privacy Policy and Cookies
            Policy.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <p className="text-center text-gray-600">
            Have an account?{" "}
            <Link
              href="/login"
              className="text-blue-500 font-semibold hover:text-blue-600 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
