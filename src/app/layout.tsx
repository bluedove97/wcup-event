import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: '2026 월드컵 기념 만원빵 이벤트',
  description: '2026 FIFA 월드컵 A조 예선 대한민국 경기 승/무/패 베팅 이벤트',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';
  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/login';
  const isFullScreen = isAdmin || isLogin;

  return (
    <html lang="ko">
      <body>
        {!isFullScreen && <Header />}
        {isFullScreen ? (
          children
        ) : (
          <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        )}
      </body>
    </html>
  );
}
