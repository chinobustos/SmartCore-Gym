'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lo que aceptamos desde el disco o la galeria antes de comprimir.
const MAX_FILE_BYTES = 8 * 1024 * 1024;
// Los SVG se guardan tal cual, asi que su limite es el que termina en la base.
const MAX_SVG_BYTES = 128 * 1024;
// El logo se muestra a 40px en el TopBar: 256 alcanza de sobra para retina.
const MAX_SIDE = 256;
// Por encima de esto no vale la pena conservar el archivo original.
const MAX_ORIGINAL_BYTES = 200 * 1024;

const ACCEPTED = 'image/png,image/jpeg,image/webp,image/svg+xml,image/gif';

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('El archivo no es una imagen válida.'));
    img.src = src;
  });
}

/**
 * Reduce la imagen a MAX_SIDE y la reencoda. Devuelve un data URI listo para
 * guardar en `gyms.logo_url` y para usar directo como `src` de un <img>.
 */
async function compressImage(file: File): Promise<string> {
  const original = await readAsDataUrl(file);

  // Un SVG es vectorial: pasarlo por canvas lo rasteriza y pierde nitidez.
  if (file.type === 'image/svg+xml') return original;

  const img = await loadImage(original);
  const largestSide = Math.max(img.naturalWidth, img.naturalHeight);
  if (!largestSide) throw new Error('El archivo no es una imagen válida.');

  const scale = Math.min(1, MAX_SIDE / largestSide);
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return original;
  ctx.drawImage(img, 0, 0, width, height);

  // Safari viejo ignora el tipo pedido y devuelve un PNG: lo detectamos.
  const webp = canvas.toDataURL('image/webp', 0.85);
  const resized = webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/png');

  // Un logo chico ya optimizado puede pesar menos que el reencodado.
  if (original.length <= resized.length && original.length <= MAX_ORIGINAL_BYTES) {
    return original;
  }
  return resized;
}

export interface LogoUploadProps {
  /** Data URI (o URL) del logo actual. */
  value?: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function LogoUpload({ value, onChange, id = 'logo', disabled, className }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const openPicker = () => {
    if (disabled || loading) return;
    inputRef.current?.click();
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('La imagen supera los 8 MB.');
      return;
    }
    if (file.type === 'image/svg+xml' && file.size > MAX_SVG_BYTES) {
      setError('El SVG supera los 128 KB.');
      return;
    }

    setLoading(true);
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
      setFileName(file.name);
    } catch (err: any) {
      setError(err?.message || 'No se pudo procesar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setFileName('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPTED}
        className="sr-only"
        disabled={disabled}
        onChange={e => {
          void handleFile(e.target.files?.[0]);
          // Sin esto, volver a elegir el mismo archivo no dispara el change.
          e.target.value = '';
        }}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-950 p-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-800 bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- preview local del archivo elegido */}
            <img src={value} alt="Vista previa del logo" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-slate-200">{fileName || 'Logo cargado'}</p>
            <p className="text-xs text-slate-500">Listo para usarse en tu panel.</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={openPicker}
              disabled={disabled || loading}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || loading}
              aria-label="Quitar logo"
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={disabled || loading}
          onDragOver={e => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 py-6 text-center transition-colors disabled:opacity-50',
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-slate-800 bg-slate-950 hover:border-primary/60 hover:bg-slate-900/60'
          )}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <ImagePlus className="h-5 w-5 text-slate-500" />
          )}
          <span className="text-sm font-medium text-slate-200">
            {loading ? 'Procesando imagen...' : 'Subir logo'}
          </span>
          <span className="text-xs text-slate-500">
            Elegilo desde tu galería o tu computadora · PNG, JPG o SVG · máx. 8 MB
          </span>
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export default LogoUpload;
