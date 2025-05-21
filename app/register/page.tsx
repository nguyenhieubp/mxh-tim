'use client';
import RegisterForm from '@/components/auth/RegisterForm';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng ký',
}

export default function RegisterPage() {
    return <RegisterForm />;
}