import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vault | Institutional Portfolio Intelligence',
  description: 'Enterprise-grade financial dashboard with real-time portfolio analytics, AI-powered insights, and institutional-level data visualization.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}