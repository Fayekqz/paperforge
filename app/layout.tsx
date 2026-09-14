import type { Metadata } from 'next';
import { IBM_Plex_Sans, Lora } from 'next/font/google';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-chrome-sans',
  display: 'swap',
});

const loraSerif = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-paper-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PaperForge — Academic Question Paper Generator',
  description:
    'A deterministic constraint-solving instrument for educators generating syllabus-compliant examination papers with mathematical mark guarantees and transparent constraint relaxation audits.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${loraSerif.variable} h-full`}>
      <body className="min-h-full bg-[#F3F0E9] text-[#181716] font-sans antialiased flex flex-col selection:bg-[#80182A] selection:text-[#FAF8F5]">
        {children}
      </body>
    </html>
  );
}
