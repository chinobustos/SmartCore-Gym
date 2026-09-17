import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { accessLevelFor } from "@/lib/access";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === '/login';
  const isRegisterPage = request.nextUrl.pathname === '/register';
  const isBillingPage = request.nextUrl.pathname === '/billing';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  // La raiz es la landing publica: tiene que verse sin sesion.
  const isLandingPage = request.nextUrl.pathname === '/';

  const isPublicPage = isLoginPage || isRegisterPage || isLandingPage;

  // Protect unauthenticated routes
  if (!user && !isPublicPage && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Nivel de acceso del gimnasio.
  //
  // Antes esto pateaba a /billing apenas vencia la suscripcion, y con eso el
  // modo lectura no existia: el cliente no llegaba ni a ver sus datos. Ahora
  // solo se redirige cuando el acceso esta cerrado del todo (mas de 60 dias
  // vencido). En modo lectura se navega normal y la escritura la frena la RLS.
  if (user && !isBillingPage && !isApiRoute && !isPublicPage) {
    try {
      const { data: profile } = await supabase
        .from('users')
        .select('gym_id')
        .eq('id', user.id)
        .single();

      if (profile?.gym_id) {
        const { data: gym } = await supabase
          .from('gyms')
          .select('subscription_status, trial_ends_at, current_period_end')
          .eq('id', profile.gym_id)
          .single();

        if (gym) {
          const nivel = accessLevelFor({
            subscriptionStatus: gym.subscription_status,
            trialEndsAt: gym.trial_ends_at,
            currentPeriodEnd: gym.current_period_end,
          });

          if (nivel === 'locked') {
            const url = request.nextUrl.clone();
            url.pathname = '/billing';
            url.searchParams.set('reason', 'locked');
            return NextResponse.redirect(url);
          }
        }
      }
    } catch (err) {
      console.error('Middleware subscription evaluation error:', err);
    }
  }

  return supabaseResponse;
};

