import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
} 