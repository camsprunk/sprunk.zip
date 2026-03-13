import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AgentationProvider from '@/components/AgentationProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'sprunk.zip',
  description: 'sprunk.zip',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans text-base antialiased bg-white text-neutral-900">
        {children}
        <AgentationProvider />
      </body>
    </html>
  );
}
