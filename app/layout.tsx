import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'Eman Bakery – Complaints',
  description: 'Submit your complaint directly to Eman Bakery',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-arabic bg-amber-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
