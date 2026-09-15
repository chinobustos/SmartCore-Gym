import { Archivo, Chivo, Chivo_Mono } from 'next/font/google';

/**
 * Sistema tipografico de la landing.
 *
 * Las tres familias son de Omnibus-Type, foundry argentina: para un producto
 * hecho para gimnasios argentinos es una eleccion con fundamento, no una
 * fuente elegida al azar.
 */

/** Titulos: grotesca pesada, con aire de cartel de gimnasio. */
export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

/** Texto corrido. */
export const chivo = Chivo({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
});

/** Etiquetas y datos: que los estados se lean como informacion operativa. */
export const chivoMono = Chivo_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
