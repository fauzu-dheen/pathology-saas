import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './auth/LoginPage'
import OnboardPage from './auth/OnboardPage'
import DashboardPage from './pages/DashboardPage'
import ReportsPage from './reports/pages/ReportsPage'
import UsersPage from './users/pages/UsersPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('access_token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboard" element={<OnboardPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
              <UsersPage />
            </RequireAuth>
          }
        />
        <Route
          path="/reports"
          element={
            <RequireAuth>
              <ReportsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
