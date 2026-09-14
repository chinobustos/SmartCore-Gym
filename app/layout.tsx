import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SmartCore Gym - Sistema de Gestión de Gimnasios',
  description: 'Plataforma profesional de gestión para gimnasios modernos',
};

import { AuthProvider } from '@/lib/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
