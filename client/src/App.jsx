import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'


const Login = lazy(() => import('./pages/Login/Login'))
const Student = lazy(() => import('./pages/Student/Student'))
const Prof = lazy(() => import('./pages/Prof/Prof'))


const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-500 mb-4"></div>
      <p className="text-slate-600">Loading...</p>
    </div>
  </div>
)

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="Student">
                <Student />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prof"
            element={
              <ProtectedRoute requiredRole="Professor">
                <Prof />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App

