import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generatePaymentLink(memberId: string, amount: number) {
  // Simulación de generación de link (ej: Mercado Pago)
  const baseUrl = 'https://mpago.la/s/';
  const randomHash = Math.random().toString(36).substring(2, 8);
  return `${baseUrl}smartcore-gym-${memberId}-${randomHash}`;
}

