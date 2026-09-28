import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from './sign-out-button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error: claimsError } =
    await supabase.auth.getClaims()

  const claims = data?.claims

  if (claimsError || !claims?.sub) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_path')
    .eq('id', claims.sub)
    .single()

  if (error) {
    return (
      <main>
        <h1>Private Dashboard</h1>
        <p>Could not load your profile.</p>
      </main>
    )
  }

  let avatarUrl: string | null = null

  if (profile?.avatar_path) {
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(profile.avatar_path)

    avatarUrl = data.publicUrl
  }

  return (
    <main>
      <h1>Private Dashboard</h1>

      <p>
        This page is only available to signed-in users.
      </p>

      <h2>
        Welcome, {profile?.first_name} {profile?.last_name}
      </h2>

      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="Profile"
          width={160}
          height={160}
        />
      )}

      <p>
        <Link href="/profile">Edit Profile</Link>
      </p>

      <p>
        <Link href="/">Back to Home</Link>
      </p>

      <SignOutButton />
    </main>
  )
}