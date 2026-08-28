import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Narrow down your BTO',
  description: 'A visual way to explore BTO locations across Singapore.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
