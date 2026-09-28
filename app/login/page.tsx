'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signInWithGoogle() {
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <main>
      <h1>Sign In</h1>

      <p>Sign in with Google to access your profile and dashboard.</p>

      <button onClick={signInWithGoogle} disabled={loading}>
        {loading ? 'Redirecting...' : 'Sign in with Google'}
      </button>

      {error && <p>{error}</p>}
    </main>
  )
}