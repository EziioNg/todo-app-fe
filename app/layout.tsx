import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import ParticleBackground from '@/components/particle-background';

const inter = Inter({ subsets: ['vietnamese'] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ParticleBackground />
            <div className="relative z-10 min-h-screen">{children}</div>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </>
  );
}
