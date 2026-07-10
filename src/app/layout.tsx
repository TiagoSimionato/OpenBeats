import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import 'frontend/globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'OpenBeats',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} lang="en">
    <body className="flex min-h-full flex-col p-4 md:p-6">{children}</body>
  </html>
);

export default RootLayout;
