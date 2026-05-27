'use client';

import { GymProvider } from '@/lib/context/GymContext';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { usePathname } from 'next/navigation';

export default function GymLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // El portal del socio empieza con /member pero no es /members (gestión admin)
  const isMemberPortal = pathname === '/member' || pathname.startsWith('/member/');

  if (isMemberPortal) {
    return (
      <GymProvider>
        <div className="min-h-screen bg-background overflow-x-hidden">
          <main className="flex-1 pb-24">
            {children}
          </main>
        </div>
      </GymProvider>
    );
  }

  return (
    <GymProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
            {children}
          </main>
        </div>
      </div>
    </GymProvider>
  );
}
