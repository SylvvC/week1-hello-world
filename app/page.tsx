import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from './dashboard/sign-out-button'

export default async function Home() {
  const supabase = await createClient()

  const { data: programs, error: programsError } = await supabase
    .from('courses')
    .select('*')
    .order('id')

  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  let profile: {
    first_name: string | null
    last_name: string | null
  } | null = null

  if (userId) {
    const { data } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', userId)
      .maybeSingle()

    profile = data
  }

  return (
    <main>
      <h1>Student Hub</h1>

      <p>
        View your academic programs and manage your account.
      </p>

      <h2>Academic Programs</h2>

      {programsError ? (
        <p>Error loading academic programs: {programsError.message}</p>
      ) : (
        <ul>
          {programs?.map((program) => (
            <li key={program.id}>
              {program.name} — {program.status}
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h2>Account</h2>

      {!userId ? (
        <>
          <p>
            Sign in to manage your profile and access your private dashboard.
          </p>

          <Link href="/login">
            Sign in with Google
          </Link>
        </>
      ) : (
        <>
          {profile?.first_name && profile?.last_name ? (
            <p>
              Welcome, {profile.first_name} {profile.last_name}.
            </p>
          ) : (
            <p>
              Your profile is incomplete. Please add your name.
            </p>
          )}

          <p>
            <Link href="/profile">Profile</Link>
          </p>

          <p>
            <Link href="/dashboard">Private Dashboard</Link>
          </p>

          <SignOutButton />
        </>
      )}
    </main>
  )
}