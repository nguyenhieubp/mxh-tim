import type { Metadata } from 'next'
import HomePage from './HomePage';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description: 'Trang chủ của mạng xã hội - Nơi kết nối và chia sẻ',
}

export default function Home() {
  return <HomePage />;
}
