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
      <main>
        <h1>Profile</h1>
        <p>Could not load your profile.</p>
        <p>{error.message}</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Profile</h1>

      <p>Signed in as {user.email}</p>

      <ProfileForm
        userId={user.id}
        initialFirstName={profile?.first_name ?? ''}
        initialLastName={profile?.last_name ?? ''}
        initialAvatarPath={profile?.avatar_path ?? null}
      />
    </main>
  )
}