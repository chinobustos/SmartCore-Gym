'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { READ_ONLY_MSG } from '@/lib/context/GymContext';

/**
 * Props para los botones que cargan datos, segun el nivel de acceso.
 *
 * Es cortesia, no seguridad: el candado real son las policies de la base, y el
 * guard de GymContext corta cualquier escritura que se cuele. Esto existe para
 * que en modo lectura el boton se vea apagado y diga por que, en vez de dejar
 * que el usuario llene un formulario entero para que falle al final.
 *
 * Uso:
 *   const { writeProps } = useWriteGate();
 *   <button {...writeProps} className="... disabled:opacity-50">
 */
export function useWriteGate() {
  const { canWrite } = useAuth();

  return {
    canWrite,
    writeProps: canWrite
      ? {}
      : { disabled: true, title: READ_ONLY_MSG, 'aria-disabled': true as const },
  };
}
