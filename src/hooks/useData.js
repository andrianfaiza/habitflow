import { useContext } from 'react'
import { DataContext } from '../context/dataContext'

// Convenience hook to access the shared task / habit state.
export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
