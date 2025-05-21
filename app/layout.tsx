import "./globals.css";
import "../configs/languages/i18n";
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Social Network',
    default: 'Social Network - Kết nối và chia sẻ',
  },
  description: 'Nền tảng mạng xã hội kết nối mọi người, chia sẻ khoảnh khắc và tương tác với nhau.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
