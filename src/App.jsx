import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
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

// Shell for authenticated pages: header + routed page content.
function AppLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="py-6">
        <Container>
          <Outlet />
        </Container>
      </main>
    </div>
  )
}

// Renders the correct screen based on the authentication state and the
// current URL route.
function AppContent() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader label="Memuat HabitFlow..." />
      </div>
    )
  }

  // Unauthenticated users only see the auth screen. Any deep link is reset to
  // the root so the address bar stays consistent after signing out.
  if (!user) {
    if (location.pathname !== '/') {
      return <Navigate to="/" replace />
    }
    return <AuthScreen />
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
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
