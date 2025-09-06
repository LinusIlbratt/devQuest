import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from '@/components/clientProviders';

export const metadata: Metadata = {
  title: 'DevQuest',
  description: 'Gamified learning platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
