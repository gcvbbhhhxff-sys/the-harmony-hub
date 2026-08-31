import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/admin/login") {
    return NextResponse.rewrite(new URL("/admin-login", request.url));
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.redirect(new URL("/admin/login?error=config", request.url));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) return NextResponse.redirect(new URL("/admin/login", request.url));

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id,papel")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminError || !admin) return NextResponse.redirect(new URL("/admin/login?error=unauthorized", request.url));

  const adminOnly = /^\/admin\/(cardapio|cupons|zonas-de-entrega|configuracoes)(\/|$)/;
  if (admin.papel !== "admin" && adminOnly.test(pathname)) return NextResponse.redirect(new URL("/admin", request.url));

  return response;
}

export const config = { matcher: ["/admin/:path*", "/admin/login"] };
