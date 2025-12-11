import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { onAuthStateChanged, getUserProfile, saveUserProfile } from '../firebase'
import { getProfessorByUid } from '../services/professors'
import { getStudentByUid } from '../services/students'

export default function ProtectedRoute({ children, requiredRole = 'Professor' }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (!user) {
        setAuthorized(false)
        setLoading(false)
        return
      }

      try {
        let profile = await getUserProfile(user.uid)
        if (!profile) {
          profile =
            requiredRole === 'Professor'
              ? await getProfessorByUid(user.uid)
              : requiredRole === 'Student'
                ? await getStudentByUid(user.uid)
                : null

          if (profile) {
            await saveUserProfile(user.uid, profile)
          }
        }

        if (profile && profile.role === requiredRole) {
          setAuthorized(true)
        } else if (!profile) {
          try {
            const raw = sessionStorage.getItem('currentUser')
            if (raw) {
              const s = JSON.parse(raw)
              if (s.type === requiredRole) setAuthorized(true)
              else setAuthorized(false)
            } else {
              setAuthorized(false)
            }
          } catch (e) {
            console.warn('ProtectedRoute sessionStorage parse error', e)
            setAuthorized(false)
          }
        } else {
          setAuthorized(false)
        }
      } catch (e) {
        console.error('ProtectedRoute error fetching profile', e)
        setAuthorized(false)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [requiredRole])

  if (loading) return null
  if (!authorized) return <Navigate to="/login" replace />
  return children
}

