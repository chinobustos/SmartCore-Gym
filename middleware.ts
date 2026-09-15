import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Los assets de la PWA (manifest, service worker, iconos y la pagina
    // offline) tienen que ser publicos: si el middleware los redirige a
    // /login, el navegador no puede registrar el SW ni ofrecer instalar.
    '/((?!api|_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js|offline.html).*)',
  ],
};
