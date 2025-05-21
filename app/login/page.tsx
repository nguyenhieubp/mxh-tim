"use client";
import LoginForm from "@/components/auth/LoginForm";
import Head from "next/head";

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Đăng nhập</title>
        <meta name="description" content="Trang đăng nhập." />
      </Head>
      <LoginForm />
    </>
  );
}
