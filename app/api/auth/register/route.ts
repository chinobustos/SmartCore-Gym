import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Necesita la service role key: nunca Edge.
export const runtime = 'nodejs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// El logo llega como data URI: el cliente lo reduce a 256px antes de enviarlo,
// pero el endpoint es publico y no podemos confiar en eso.
const MAX_LOGO_CHARS = 700 * 1024;
const DATA_URI_IMAGE = /^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,/;

function sanitizeLogo(logoUrl: unknown): { value: string | null; error?: string } {
  if (typeof logoUrl !== 'string' || !logoUrl) return { value: null };
  if (logoUrl.length > MAX_LOGO_CHARS) {
    return { value: null, error: 'El logo es demasiado pesado.' };
  }
  if (DATA_URI_IMAGE.test(logoUrl) || /^https?:\/\//i.test(logoUrl)) {
    return { value: logoUrl };
  }
  return { value: null, error: 'El formato del logo no es válido.' };
}

export async function POST(request: Request) {
  if (!SUPABASE_URL || !PUBLISHABLE_KEY || !SERVICE_ROLE_KEY) {
    console.error('[register] Faltan variables de entorno de Supabase');
    return NextResponse.json({ error: 'Registro no configurado.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { email, password, fullName, gymName, rubro, logoUrl, openingHours } = body;

    if (!email || !password || !gymName) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre del gimnasio son obligatorios.' },
        { status: 400 }
      );
    }

    const logo = sanitizeLogo(logoUrl);
    if (logo.error) {
      return NextResponse.json({ error: logo.error }, { status: 400 });
    }

    // Cliente publico: solo para el signUp, que es una operacion publica.
    const supabase = createClient(SUPABASE_URL, PUBLISHABLE_KEY);

    // Cliente admin: las tablas `gyms` y `users` tienen RLS sin policy de
    // INSERT (y no podria haberla: el usuario todavia no pertenece a ningun
    // gym). El alta la hace el servidor con la service role key.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Alta del usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName || gymName,
        },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Error al crear la cuenta de usuario.' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Fin del periodo de prueba: 14 dias.
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // 3. Crear el gimnasio
    const { data: gymData, error: gymError } = await admin
      .from('gyms')
      .insert([
        {
          name: gymName,
          rubro: rubro || 'Gimnasio General',
          logo_url: logo.value,
          opening_hours: openingHours || { Lunes: '07:00 - 22:00', Viernes: '07:00 - 22:00' },
          subscription_status: 'trialing',
          trial_ends_at: trialEndsAt.toISOString(),
        },
      ])
      .select()
      .single();

    if (gymError || !gymData) {
      console.error('[register] Error creando el gimnasio:', gymError);
      // Sin gym el usuario de Auth queda huerfano: lo damos de baja.
      await admin.auth.admin.deleteUser(userId).catch((e) => {
        console.error('[register] No se pudo revertir el usuario de Auth:', e);
      });
      return NextResponse.json(
        { error: 'Error al registrar la información del gimnasio.' },
        { status: 500 }
      );
    }

    // 4. Perfil que vincula usuario <-> gimnasio
    const { error: profileError } = await admin.from('users').insert([
      {
        id: userId,
        gym_id: gymData.id,
        role: 'owner',
        full_name: fullName || gymName,
      },
    ]);

    if (profileError) {
      console.error('[register] Error creando el perfil:', profileError);
      // Sin perfil el usuario no puede resolver su gym_id: revertimos todo
      // en vez de devolver un exito que deja la cuenta inutilizable.
      await admin.from('gyms').delete().eq('id', gymData.id);
      await admin.auth.admin.deleteUser(userId).catch((e) => {
        console.error('[register] No se pudo revertir el usuario de Auth:', e);
      });
      return NextResponse.json(
        { error: 'Error al vincular la cuenta con el gimnasio.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      gymId: gymData.id,
      userId,
      message: 'Gimnasio y cuenta creados exitosamente con 14 días de prueba.',
    });
  } catch (error: any) {
    console.error('[register] Error inesperado:', error);
    return NextResponse.json(
      { error: error?.message || 'Ocurrió un error inesperado durante el registro.' },
      { status: 500 }
    );
  }
}
