"use client";

import { ReduxProvider } from "../configs/redux/ClientOnly";
import { AuthProvider } from "@/contexts/AuthContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ReduxProvider>
  );
} 