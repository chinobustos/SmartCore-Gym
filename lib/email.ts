// Envio de mails por el SMTP de Gmail.
//
// Se eligio Gmail y no un servicio tipo Resend o Brevo por una razon concreta:
// sin un dominio propio verificado, esos servicios obligan a mandar desde una
// direccion @gmail.com que ellos no estan autorizados a usar, el DMARC de
// gmail.com no alinea y los avisos terminan en spam. Con el SMTP de Gmail se
// manda autenticado como la cuenta, asi que el SPF y el DKIM son los de Google
// y el mail llega. Ademas es gratis y no hace falta comprar nada.
//
// El limite de Gmail es de unos 500 destinatarios por dia, de sobra para avisos
// de fin de prueba. Si algun dia se pasa de ahi, hay que mover esto a un
// servicio con dominio propio: toda la app entra por `sendEmail`, asi que el
// cambio queda contenido en este archivo.

import nodemailer, { type Transporter } from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
// Nombre que ve el destinatario. La direccion sigue siendo la de GMAIL_USER:
// Gmail no deja falsear el remitente.
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'SmartCore Gym';

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
  return !!GMAIL_USER && !!GMAIL_APP_PASSWORD;
}

let transporter: Transporter | null = null;

/**
 * El transporte se reusa entre invocaciones: en una funcion serverless que
 * manda varios mails seguidos, abrir una conexion SMTP por mail es tiempo
 * regalado. `pool` mantiene la conexion viva dentro de la misma invocacion.
 */
function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      pool: true,
      auth: {
        user: GMAIL_USER,
        // Es una contraseña de aplicacion de Google, no la del mail. Requiere
        // tener la verificacion en dos pasos activada en la cuenta.
        pass: GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<SendEmailResult> {
  if (!emailConfigurado()) {
    return { ok: false, error: 'Faltan GMAIL_USER / GMAIL_APP_PASSWORD.' };
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"${EMAIL_FROM_NAME}" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return { ok: true, id: info.messageId };
  } catch (err: any) {
    // El error de Gmail incluye la direccion de origen, no la clave.
    console.error('[email] No se pudo enviar:', err?.message ?? err);
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
