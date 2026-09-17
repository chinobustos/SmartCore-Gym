// Envio de mails con Resend.
//
// Se habla con la API por fetch en vez de sumar el SDK: es un unico POST y
// asi el proyecto no gana una dependencia mas para eso.

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM = process.env.RESEND_FROM || 'SmartCore Gym <onboarding@resend.dev>';

const RESEND_API = 'https://api.resend.com/emails';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

export function emailConfigurado(): boolean {
  return !!RESEND_API_KEY;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY no está configurada.' };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html }),
      cache: 'no-store',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const detail = data?.message || `HTTP ${res.status}`;
      console.error('[email] Resend rechazo el envio:', detail);
      return { ok: false, error: detail };
    }

    return { ok: true, id: data?.id };
  } catch (err: any) {
    console.error('[email] Error de red enviando el mail:', err);
    return { ok: false, error: err?.message ?? String(err) };
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://smartcoregym.vercel.app';

/**
 * Aviso de que se termina la prueba gratuita.
 *
 * HTML a mano y con estilos en linea: los clientes de correo descartan las
 * hojas de estilo, asi que no hay nada que reutilizar de la app.
 */
export function trialReminderEmail(gymName: string, daysLeft: number) {
  const dias = daysLeft === 1 ? 'queda 1 día' : `quedan ${daysLeft} días`;

  return {
    subject: `Te ${dias} de prueba en SmartCore Gym`,
    html: `
<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f172a">
  <h1 style="font-size:20px;margin:0 0 16px">Hola, ${escapeHtml(gymName)}</h1>

  <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
    Te ${dias} de prueba gratuita en SmartCore Gym.
  </p>

  <p style="font-size:15px;line-height:1.6;margin:0 0 24px">
    Cuando se termine, tu cuenta pasa a <strong>modo lectura</strong>: vas a
    poder seguir viendo y exportando toda tu información, pero no cargar socios,
    cobrar ni registrar ingresos. Tus datos quedan guardados 60 días.
  </p>

  <a href="${SITE_URL}/billing"
     style="display:inline-block;background:#0ea5e9;color:#020617;font-weight:700;
            text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px">
    Activar mi suscripción
  </a>

  <p style="font-size:13px;line-height:1.6;color:#64748b;margin:24px 0 0">
    $60.000 por mes, sin permanencia. Podés darla de baja cuando quieras desde
    la misma pantalla.
  </p>
</div>`.trim(),
  };
}

/** El nombre del gimnasio lo elige el usuario: nunca va crudo al HTML. */
function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
