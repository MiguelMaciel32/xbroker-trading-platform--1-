import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // 👤 Recupera usuário da sessão
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 🚨 Se não tiver usuário -> manda para login
  // if (
  //   !user &&
  //   !request.nextUrl.pathname.startsWith("/login") &&
  //   !request.nextUrl.pathname.startsWith("/register") &&
  //   request.nextUrl.pathname !== "/"
  // ) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = "/login"
  //   return NextResponse.redirect(url)
  // }

  // 🚨 Se já tiver user -> evita acessar login/register de novo
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/trading" // 👈 dashboard ou rota inicial
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
