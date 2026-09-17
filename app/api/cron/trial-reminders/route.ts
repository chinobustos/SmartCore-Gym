import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/subscription';
import { emailConfigurado, sendEmail, trialReminderEmail } from '@/lib/email';
import { TRIAL_REMINDER_DAYS } from '@/lib/access';

// Usa la service role key: nunca Edge.
export const runtime = 'nodejs';
// El resultado depende de la fecha, asi que no se cachea nunca.
export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET || '';

/**
 * Avisa por mail a los gimnasios a los que les faltan pocos dias de prueba.
 *
 * Lo dispara el cron de Vercel una vez por dia (ver `vercel.json`). Vercel manda
 * el header `Authorization: Bearer $CRON_SECRET` solo, siempre que la variable
 * este cargada en el proyecto.
 *
 * Es idempotente: `trial_reminder_sent_at` se marca despues de cada envio, asi
 * que si el cron corre dos veces en el dia nadie recibe el aviso repetido.
 */
export async function GET(request: Request) {
  if (!CRON_SECRET) {
    console.error('[cron] Falta CRON_SECRET');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }

  // Fallar cerrado: la ruta expone mails de clientes.
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${CRON_SECRET}`) {
    console.warn('[cron] Llamada sin el secreto correcto, descartada');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!emailConfigurado()) {
    console.error('[cron] Faltan GMAIL_USER / GMAIL_APP_PASSWORD');
    return NextResponse.json({ error: 'Email not configured' }, { status: 500 });
  }

  try {
    const admin = createAdminClient();

    const { data: pendientes, error } = await admin.rpc('gyms_needing_trial_reminder', {
      days_before: TRIAL_REMINDER_DAYS,
    });

    if (error) {
      console.error('[cron] No se pudo consultar a quien avisar:', error.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const filas: Array<{
      gym_id: string;
      gym_name: string;
      email: string;
      days_left: number;
    }> = pendientes ?? [];

    let enviados = 0;
    const fallidos: Array<{ gymId: string; error: string }> = [];

    for (const fila of filas) {
      const { subject, html } = trialReminderEmail(fila.gym_name, fila.days_left);
      const result = await sendEmail({ to: fila.email, subject, html });

      if (!result.ok) {
        // No se marca la columna: al no marcarla, el aviso se reintenta mañana.
        fallidos.push({ gymId: fila.gym_id, error: result.error ?? 'error desconocido' });
        continue;
      }

      const { error: markError } = await admin
        .from('gyms')
        .update({ trial_reminder_sent_at: new Date().toISOString() })
        .eq('id', fila.gym_id);

      if (markError) {
        // El mail ya salio. Si no se puede marcar, se avisa fuerte: mañana se
        // manda de nuevo y el cliente recibe el aviso dos veces.
        console.error(
          `[cron] Mail enviado a ${fila.gym_id} pero no se pudo marcar trial_reminder_sent_at:`,
          markError.message
        );
      }

      enviados++;
    }

    console.log('[cron] Avisos de fin de prueba', {
      candidatos: filas.length,
      enviados,
      fallidos: fallidos.length,
    });

    return NextResponse.json({
      ok: true,
      candidatos: filas.length,
      enviados,
      fallidos,
    });
  } catch (err: any) {
    console.error('[cron] Error inesperado:', err);
    return NextResponse.json({ error: err?.message ?? 'Error inesperado' }, { status: 500 });
  }
}
