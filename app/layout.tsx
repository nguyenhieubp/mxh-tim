"use client";

import { ReduxProvider } from "../configs/redux/ClientOnly";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import "../configs/languages/i18n";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
