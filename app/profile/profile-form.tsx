'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ProfileFormProps = {
  userId: string
  initialFirstName: string
  initialLastName: string
  initialAvatarPath: string | null
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const MAX_FILE_SIZE = 5 * 1024 * 1024

export default function ProfileForm({
  userId,
  initialFirstName,
  initialLastName,
  initialAvatarPath,
}: ProfileFormProps) {
  const router = useRouter()

  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [avatarPath, setAvatarPath] = useState(initialAvatarPath)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()

  let avatarUrl: string | null = null

  if (avatarPath) {
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(avatarPath)

    avatarUrl = data.publicUrl
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSaving(true)
    setMessage('')
    setError('')

    const cleanFirstName = firstName.trim()
    const cleanLastName = lastName.trim()

    if (!cleanFirstName || !cleanLastName) {
      setError('First name and last name are required.')
      setSaving(false)
      return
    }

    let newAvatarPath = avatarPath
    let uploadedPath: string | null = null

    if (selectedFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
        setError('Please choose a JPEG, PNG, WebP, or GIF image.')
        setSaving(false)
        return
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('The image must be 5 MB or smaller.')
        setSaving(false)
        return
      }

      const extension =
        selectedFile.name.split('.').pop()?.toLowerCase() || 'jpg'

      uploadedPath =
        `${userId}/avatar-${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(uploadedPath, selectedFile, {
          contentType: selectedFile.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`)
        setSaving(false)
        return
      }

      newAvatarPath = uploadedPath
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: cleanFirstName,
        last_name: cleanLastName,
        avatar_path: newAvatarPath,
      })
      .eq('id', userId)

    if (updateError) {
      if (uploadedPath) {
        await supabase.storage
          .from('avatars')
          .remove([uploadedPath])
      }

      setError(`Profile update failed: ${updateError.message}`)
      setSaving(false)
      return
    }

    if (
      uploadedPath &&
      avatarPath &&
      avatarPath !== uploadedPath
    ) {
      await supabase.storage
        .from('avatars')
        .remove([avatarPath])
    }

    setAvatarPath(newAvatarPath)
    setSelectedFile(null)
    setMessage('Profile saved successfully.')
    setSaving(false)

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      {avatarUrl && (
        <div>
          <p>Current photo:</p>

          <img
            src={avatarUrl}
            alt="Profile"
            width={160}
            height={160}
          />
        </div>
      )}

      <div>
        <label htmlFor="first-name">First name</label>
        <br />

        <input
          id="first-name"
          type="text"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
      </div>

      <br />

      <div>
        <label htmlFor="last-name">Last name</label>
        <br />

        <input
          id="last-name"
          type="text"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
      </div>

      <br />

      <div>
        <label htmlFor="avatar">Profile photo</label>
        <br />

        <input
          id="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => {
            setSelectedFile(event.target.files?.[0] ?? null)
          }}
        />

        <p>JPEG, PNG, WebP, or GIF. Maximum 5 MB.</p>
      </div>

      {selectedFile && (
        <p>Selected: {selectedFile.name}</p>
      )}

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  )
}