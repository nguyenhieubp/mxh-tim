'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AlertSnackbar from "../common/AlertSnackbar";
import axios from "axios";

const ForgotPasswordForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");

    const [alert, setAlert] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    const handleCloseAlert = () => {
        setAlert((prev) => ({ ...prev, open: false }));
    };

    const validateEmailFormat = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmailFormat(email)) {
            setEmailError("Email không hợp lệ");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER}/auth/forgot-password`,
                { email }
            );

            if (response.data.status === 200) {
                setAlert({
                    open: true,
                    message: "Vui lòng kiểm tra email của bạn để đặt lại mật khẩu",
                    severity: "success",
                });
            }
        } catch (error: any) {
            setAlert({
                open: true,
                message: error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Quên mật khẩu
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setEmailError("");
                                }}
                                className={`w-full px-4 py-3 rounded-xl border ${emailError ? "border-red-500" : "border-gray-200"
                                    } focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50`}
                                required
                            />
                            {emailError && (
                                <p className="mt-1 text-sm text-red-500">{emailError}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!email || loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
                        </button>
                    </form>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm text-blue-500 font-semibold hover:text-blue-600 transition-colors"
                        >
                            Quay lại đăng nhập
                        </Link>
                    </div>
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

export default ForgotPasswordForm; 