import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import * as profileService from '../services/profileService'
import { ProfileContext } from './profileContext'

// Loads and exposes the current user's profile and preferences.
export function ProfileProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setProfile(await profileService.fetchOrCreateProfile(user))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // Load the profile whenever the authenticated user changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  // Updates display fields with an optimistic UI and rollback on failure.
  const saveProfile = useCallback(
    async (patch) => {
      const snapshot = profile
      setProfile((prev) => ({ ...prev, ...patch }))
      try {
        const updated = await profileService.updateProfile(user.id, patch)
        setProfile(updated)
        return updated
      } catch (err) {
        setProfile(snapshot)
        setError(err.message)
        throw err
      }
    },
    [user, profile],
  )

  // Persists the full preferences blob.
  const savePreferences = useCallback(
    async (nextPreferences) => {
      const snapshot = profile
      setProfile((prev) => ({ ...prev, preferences: nextPreferences }))
      try {
        const updated = await profileService.updatePreferences(user.id, nextPreferences)
        setProfile(updated)
        return updated
      } catch (err) {
        setProfile(snapshot)
        setError(err.message)
        throw err
      }
    },
    [user, profile],
  )

  const value = useMemo(
    () => ({ profile, loading, error, setError, reload: load, saveProfile, savePreferences }),
    [profile, loading, error, load, saveProfile, savePreferences],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}
