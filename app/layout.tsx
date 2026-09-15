import './globals.css';
import type { Metadata, Viewport } from 'next';

import { AuthProvider } from '@/lib/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration';

export const metadata: Metadata = {
  title: 'SmartCore Gym - Sistema de Gestión de Gimnasios',
  description: 'Plataforma profesional de gestión para gimnasios modernos',
  manifest: '/manifest.webmanifest',
  applicationName: 'SmartCore Gym',
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'SmartCore',
    statusBarStyle: 'default',
  },
};

// En Next 15 themeColor y viewport van en su propio export, no en metadata.
export const viewport: Viewport = {
  themeColor: '#10b77f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
