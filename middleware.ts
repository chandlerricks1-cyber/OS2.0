import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as never)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Public routes — no auth needed
  const publicRoutes = ['/', '/login', '/signup']
  const isPublic =
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/podcast') ||
    pathname.startsWith('/api/podcast') ||
    pathname.startsWith('/brand-script') ||
    pathname.startsWith('/api/brand-script') ||
    pathname.startsWith('/mortgage-holds') ||
    pathname.startsWith('/pov-pro') ||
    pathname === '/POV-Engine' ||
    pathname === '/POV-Engine.html' ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/api/webhooks/') ||
    pathname.startsWith('/m/')
  if (isPublic) {
    // Redirect logged-in users away from auth pages
    if (user && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/intake', request.url))
    }
    return supabaseResponse
  }

  // All other routes require auth
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect old /admin routes to new /dashboard/admin
  if (pathname.startsWith('/admin')) {
    const newPath = pathname.replace(/^\/admin/, '/dashboard/admin')
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  // Admin routes require admin role
  if (pathname.startsWith('/dashboard/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Dashboard routes — accessible to all authenticated users
  if (pathname.startsWith('/dashboard')) {
    return supabaseResponse
  }

  // Intake requires completed session check (but don't gate — let page handle)
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov)$).*)',
  ],
}
