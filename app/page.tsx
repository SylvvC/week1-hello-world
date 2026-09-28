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

  const hasCompleteProfile =
    Boolean(profile?.first_name?.trim()) &&
    Boolean(profile?.last_name?.trim())

  const displayName = hasCompleteProfile
    ? `${profile!.first_name} ${profile!.last_name}`
    : 'Complete your profile'

  const accountInitials = hasCompleteProfile
    ? `${profile!.first_name![0]}${profile!.last_name![0]}`.toUpperCase()
    : 'U'

  return (
    <main className="app-shell">
      <div className="page-card">
        <header className="hero">
          <span className="eyebrow">Student Hub</span>

          <h1>
            Your academic life,
            <br />
            all in one place.
          </h1>

          <p>
            View your academic programs and securely manage your
            personal profile.
          </p>
        </header>

        <section className="section">
          <div className="section-heading">
            <h2>Academic Programs</h2>

            {!programsError && (
              <span className="section-note">
                {programs?.length ?? 0} programs
              </span>
            )}
          </div>

          {programsError ? (
            <p>
              Error loading academic programs:
              {' '}
              {programsError.message}
            </p>
          ) : (
            <div className="program-grid">
              {programs?.map((program) => {
                const monogram = program.name
                  .split(' ')
                  .map((word: string) => word[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                const badgeClass =
                  program.status === 'Major'
                    ? 'badge badge-major'
                    : 'badge badge-minor'

                return (
                  <article
                    className="program-card"
                    key={program.id}
                  >
                    <div className="program-monogram">
                      {monogram}
                    </div>

                    <h3>{program.name}</h3>

                    <span className={badgeClass}>
                      {program.status}
                    </span>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-heading">
            <h2>Account</h2>
          </div>

          {!userId ? (
            <div className="account-card">
              <div className="account-summary">
                <div className="avatar-initials">
                  ?
                </div>

                <div>
                  <span className="eyebrow">
                    Guest
                  </span>

                  <h3>Sign in to continue</h3>

                  <p>
                    Access your profile and private dashboard.
                  </p>
                </div>
              </div>

              <div className="action-row">
                <Link
                  className="button-link"
                  href="/login"
                >
                  Sign in with Google
                </Link>
              </div>
            </div>
          ) : (
            <div className="account-card">
              <div className="account-summary">
                <div className="avatar-initials">
                  {accountInitials}
                </div>

                <div>
                  <span className="eyebrow">
                    Signed in
                  </span>

                  <h3>{displayName}</h3>

                  <p>
                    {hasCompleteProfile
                      ? 'Your profile is ready.'
                      : 'Add your name to complete your profile.'}
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
                  href="/dashboard"
                >
                  Private dashboard
                </Link>

                <SignOutButton />
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}