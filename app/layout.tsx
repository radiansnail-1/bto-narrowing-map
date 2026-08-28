import type { Metadata } from 'next';
import { hankenGrotesk } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Where To BTO',
  description: 'Narrow Singapore BTO projects by commute, budget, nearby amenities, and waiting time on an interactive map.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={hankenGrotesk.variable}>
      <body className={hankenGrotesk.className}>{children}</body>
    </html>
  );
}
