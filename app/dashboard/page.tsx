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
      <main className="app-shell">
        <div className="page-card">
          <h1>Private Dashboard</h1>
          <p>Could not load your profile.</p>
        </div>
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

  const displayName =
    `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()

  const initials =
    `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`
      .toUpperCase()

  return (
    <main className="app-shell">
      <div className="page-card">
        <nav className="top-nav">
          <Link
            className="back-link"
            href="/"
          >
            ← Student Hub
          </Link>

          <span className="status-pill">
            <span className="status-dot" />
            Authenticated
          </span>
        </nav>

        <header className="dashboard-intro">
          <span className="eyebrow">
            Private area
          </span>

          <h1>Your dashboard.</h1>

          <p>
            This route is only available to authenticated users.
          </p>
        </header>

        <section className="dashboard-card">
          <div className="dashboard-profile">
            {avatarUrl ? (
              <img
                className="avatar-image"
                src={avatarUrl}
                alt="Profile"
              />
            ) : (
              <div className="avatar-initials">
                {initials || 'U'}
              </div>
            )}

            <div>
              <span className="eyebrow">
                Welcome back
              </span>

              <h2>
                {displayName || 'Student'}
              </h2>

              <p>
                Your account and profile are securely connected.
              </p>
            </div>
          </div>

          <div className="action-row">
            <Link
              className="button-link"
              href="/profile"
            >
              Edit profile
            </Link>

            <Link
              className="button-link button-secondary"
              href="/"
            >
              Back home
            </Link>

            <SignOutButton />
          </div>
        </section>
      </div>
    </main>
  )
}