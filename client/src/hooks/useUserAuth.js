/**
 * Custom hook for user authentication
 * Provides consistent user authentication state and methods
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOutUser } from '../firebase'
import { getCurrentUserData, clearSessionUser } from '../utils/authHelpers'

/**
 * Hook to manage user authentication state
 * @param {string} requiredRole - Required user role ('Professor' or 'Student')
 * @returns {Object} Authentication state and methods
 */
export function useUserAuth(requiredRole = null) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      setLoading(true)
      setError(null)

      if (!firebaseUser) {
        clearSessionUser()
        setUser(null)
        setUserData(null)
        setLoading(false)
        if (requiredRole) {
          navigate('/login', { replace: true })
        }
        return
      }

      try {

        const sessionData = getCurrentUserData()
        

        if (requiredRole && sessionData?.type !== requiredRole) {
          setError(`Access denied. Required role: ${requiredRole}`)
          await signOutUser()
          navigate('/login', { replace: true })
          return
        }

        setUser(firebaseUser)
        setUserData(sessionData)
      } catch (err) {
        console.error('Auth state change error:', err)
        setError(err.message)
        await signOutUser()
        navigate('/login', { replace: true })
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [navigate, requiredRole])

  const signOut = async () => {
    try {
      await signOutUser()
      clearSessionUser()
      setUser(null)
      setUserData(null)
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err.message)
    }
  }

  return {
    user,
    userData,
    loading,
    error,
    isAuthenticated: !!user,
    signOut
  }
}

