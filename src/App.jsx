import { useState } from 'react'
import { AuthProvider } from './context/AuthProvider'
import { ProfileProvider } from './context/ProfileProvider'
import { DataProvider } from './context/DataProvider'
import { ThemeProvider } from './context/ThemeProvider'
import { useAuth } from './hooks/useAuth'
import { Loader } from './components/common/Loader'
import { Header } from './components/layout/Header'
import { Container } from './components/layout/Container'
import { AuthScreen } from './pages/Auth/AuthScreen'
import { Home } from './pages/Dashboard/Home'
import { UserProfile } from './pages/Profile/UserProfile'
import { Settings } from './pages/Profile/Settings'

// Renders the correct screen based on the authentication state and the
// currently selected view (no router needed for the MVP).
function AppContent() {
  const { user, loading } = useAuth()
  const [view, setView] = useState('dashboard')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Memuat HabitFlow..." />
      </div>
    )
  }

  // Unauthenticated users only see the auth screen.
  if (!user) return <AuthScreen />

  return (
    <div className="min-h-screen bg-surface">
      <Header currentView={view} onNavigate={setView} />
      <main className="py-6">
        <Container>
          {view === 'dashboard' ? <Home /> : null}
          {view === 'profile' ? <UserProfile /> : null}
          {view === 'settings' ? <Settings /> : null}
        </Container>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
