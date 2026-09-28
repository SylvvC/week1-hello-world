import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=missing_code', requestUrl.origin)
    )
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL('/login?error=auth_failed', requestUrl.origin)
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(
      new URL('/login?error=no_user', requestUrl.origin)
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  const firstNameMissing =
    !profile?.first_name || profile.first_name.trim() === ''

  const lastNameMissing =
    !profile?.last_name || profile.last_name.trim() === ''

  if (firstNameMissing || lastNameMissing) {
    return NextResponse.redirect(
      new URL('/profile', requestUrl.origin)
    )
  }

  return NextResponse.redirect(
    new URL('/dashboard', requestUrl.origin)
  )
}