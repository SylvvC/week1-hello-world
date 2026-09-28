import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_path')
    .eq('id', user.id)
    .single()

  if (error) {
    return (
      <main className="app-shell">
        <div className="page-card">
          <h1>Profile</h1>
          <p>Could not load your profile.</p>
          <p>{error.message}</p>
        </div>
      </main>
    )
  }

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
            Signed in
          </span>
        </nav>

        <header className="profile-header">
          <span className="eyebrow">
            Your account
          </span>

          <h1>Edit profile</h1>

          <p>
            Signed in as {user.email}
          </p>
        </header>

        <ProfileForm
          userId={user.id}
          initialFirstName={profile?.first_name ?? ''}
          initialLastName={profile?.last_name ?? ''}
          initialAvatarPath={profile?.avatar_path ?? null}
        />
      </div>
    </main>
  )
}