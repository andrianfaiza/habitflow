import { useContext } from 'react'
import { ProfileContext } from '../context/profileContext'

// Convenience hook to access the profile context.
export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
