import type { Metadata } from 'next';
import { Layout } from 'frontend/ui/Layout';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const geistSans = Geist({
  subsets: [
    'latin',
  ],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: [
    'latin',
  ],
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
  <html
    className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    lang="en"
  >
    <body className="min-h-full flex flex-col">
      <Providers>
        <Layout>
          {children}
        </Layout>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
