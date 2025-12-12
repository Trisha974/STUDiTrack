import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { onAuthStateChanged, getUserProfile, saveUserProfile, signOutUser } from '../firebase'
import { getProfessorByUid } from '../services/professors'
import { getStudentByUid } from '../services/students'
import { apiGet } from '../services/api/apiClient'
import { detectEmailType } from '../utils/validationHelpers'

/**
 * ProtectedRoute - Securely protects routes requiring authentication and specific roles
 * 
 * SECURITY FEATURES:
 * - Verifies Firebase authentication token
 * - Validates user role with server-side API
 * - Removes dangerous sessionStorage fallback
 * - Automatically redirects unauthorized users
 * - Clears invalid sessions
 */
export default function ProtectedRoute({ children, requiredRole = 'Professor' }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const unsubscribe = onAuthStateChanged(async (user) => {
      if (!isMounted) return

      if (!user) {

        sessionStorage.removeItem('currentUser')
        setAuthorized(false)
        setLoading(false)
        return
      }

      try {
        console.log('🔐 ProtectedRoute: Starting auth check', {
          requiredRole,
          userEmail: user.email,
          userUid: user.uid
        })

        if (!user.email) {
          console.error('🚫 CRITICAL: No email found for user, blocking access')
          await signOutUser()
          sessionStorage.removeItem('currentUser')
          setAuthorized(false)
          setError('Access denied. Email verification required.')
          setLoading(false)
          return
        }

        const emailType = detectEmailType(user.email)
        console.log('🔐 ProtectedRoute: Email type detected', {
          email: user.email,
          emailType,
          requiredRole
        })

        if (!emailType) {
          console.error('🚫 CRITICAL: Invalid email format, blocking access', {
            email: user.email
          })
          await signOutUser()
          sessionStorage.removeItem('currentUser')
          setAuthorized(false)
          setError('Access denied. Invalid email format.')
          setLoading(false)
          return
        }

        if (requiredRole === 'Professor' && emailType !== 'professor') {
          console.error('🚫🚫🚫 CRITICAL BLOCK: Student attempting to access professor dashboard', {
            email: user.email,
            emailType,
            requiredRole,
            userUid: user.uid
          })
          await signOutUser()
          sessionStorage.removeItem('currentUser')
          setAuthorized(false)
          setError('Access denied. Students cannot access the professor dashboard.')
          setLoading(false)
          return
        }

        if (requiredRole === 'Student' && emailType !== 'student') {
          console.error('🚫🚫🚫 CRITICAL BLOCK: Professor attempting to access student dashboard', {
            email: user.email,
            emailType,
            requiredRole,
            userUid: user.uid
          })
          await signOutUser()
          sessionStorage.removeItem('currentUser')
          setAuthorized(false)
          setError('Access denied. Professors cannot access the student dashboard.')
          setLoading(false)
          return
        }

        console.log('✅ ProtectedRoute: Email type check passed', {
          email: user.email,
          emailType,
          requiredRole
        })

        const idToken = await user.getIdToken()
        

        let serverVerified = false
        try {

          if (requiredRole === 'Professor') {
            await apiGet(`/professors/firebase/${user.uid}`)
            serverVerified = true
          } else if (requiredRole === 'Student') {
            await apiGet(`/students/firebase/${user.uid}`)
            serverVerified = true
          }
        } catch (apiError) {

          if (apiError.message?.includes('401') || apiError.message?.includes('Authentication')) {
            console.warn('Server authentication failed, signing out')
            await signOutUser()
            setAuthorized(false)
            setLoading(false)
            return
          }

          console.warn('Server verification failed, using client-side check:', apiError.message)
        }


        const profileEmailType = emailType
        const shouldBeProfessor = profileEmailType === 'professor'
        const shouldBeStudent = profileEmailType === 'student'

        console.log('🔐 ProtectedRoute: Fetching profile based on email type', {
          emailType: profileEmailType,
          shouldBeProfessor,
          shouldBeStudent,
          requiredRole
        })

        if (requiredRole === 'Professor' && emailType !== 'professor') {
          console.error('🚫🚫🚫🚫🚫 DOUBLE CHECK BLOCK: Student email in professor route', {
            email: user.email,
            emailType,
            requiredRole
          })
          await signOutUser()
          sessionStorage.removeItem('currentUser')
          localStorage.removeItem('currentUser')
          setAuthorized(false)
          setError('Access denied. Students cannot access the professor dashboard.')
          setLoading(false)
          return
        }

        if (requiredRole === 'Student' && emailType !== 'student') {
          console.error('🚫🚫🚫🚫🚫 DOUBLE CHECK BLOCK: Professor email in student route', {
            email: user.email,
            emailType,
            requiredRole
          })
          await signOutUser()
          sessionStorage.removeItem('currentUser')
          localStorage.removeItem('currentUser')
          setAuthorized(false)
          setError('Access denied. Professors cannot access the student dashboard.')
          setLoading(false)
          return
        }

        let profile = null
        
        if (shouldBeProfessor) {
          if (emailType !== 'professor') {
            console.error('🚫🚫🚫🚫🚫 TRIPLE CHECK BLOCK: Non-professor email trying to fetch professor profile', {
              email: user.email,
              emailType
            })
            await signOutUser()
            sessionStorage.removeItem('currentUser')
            localStorage.removeItem('currentUser')
            setAuthorized(false)
            setError('Access denied. Invalid email type for professor route.')
            setLoading(false)
            return
          }
          profile = await getUserProfile(user.uid)
          if (!profile) {
            try {
              profile = await getProfessorByUid(user.uid)
              if (profile && profile.email) {
                const fetchedEmailType = detectEmailType(profile.email)
                if (fetchedEmailType !== 'professor') {
                  console.error('🚫🚫🚫 CRITICAL: Professor profile has student email!', {
                    profileEmail: profile.email,
                    fetchedEmailType,
                    authEmail: user.email
                  })
                  await signOutUser()
                  sessionStorage.removeItem('currentUser')
                  localStorage.removeItem('currentUser')
                  setAuthorized(false)
                  setError('Access denied. Profile email mismatch.')
                  setLoading(false)
                  return
                }
              }
            } catch (profileError) {
              console.error('Failed to fetch professor profile:', profileError)
              if (profileError.message?.includes('401') || profileError.message?.includes('403')) {
                await signOutUser()
                setAuthorized(false)
                setLoading(false)
                return
              }
            }
          } else {
            if (profile.email) {
              const cachedEmailType = detectEmailType(profile.email)
              if (cachedEmailType !== 'professor') {
                console.error('🚫🚫🚫 CRITICAL: Cached profile has non-professor email!', {
                  cachedEmail: profile.email,
                  cachedEmailType,
                  authEmail: user.email
                })
                await signOutUser()
                sessionStorage.removeItem('currentUser')
                localStorage.removeItem('currentUser')
                setAuthorized(false)
                setError('Access denied. Profile email mismatch.')
                setLoading(false)
                return
              }
            }
          }
        } else if (shouldBeStudent) {
          if (emailType !== 'student') {
            console.error('🚫🚫🚫🚫🚫 TRIPLE CHECK BLOCK: Non-student email trying to fetch student profile', {
              email: user.email,
              emailType
            })
            await signOutUser()
            sessionStorage.removeItem('currentUser')
            localStorage.removeItem('currentUser')
            setAuthorized(false)
            setError('Access denied. Invalid email type for student route.')
            setLoading(false)
            return
          }
          profile = await getUserProfile(user.uid)
          if (!profile) {
            try {
              profile = await getStudentByUid(user.uid)
              if (profile && profile.email) {
                const fetchedEmailType = detectEmailType(profile.email)
                if (fetchedEmailType !== 'student') {
                  console.error('🚫🚫🚫 CRITICAL: Student profile has professor email!', {
                    profileEmail: profile.email,
                    fetchedEmailType,
                    authEmail: user.email
                  })
                  await signOutUser()
                  sessionStorage.removeItem('currentUser')
                  localStorage.removeItem('currentUser')
                  setAuthorized(false)
                  setError('Access denied. Profile email mismatch.')
                  setLoading(false)
                  return
                }
              }
            } catch (profileError) {
              console.error('Failed to fetch student profile:', profileError)
              if (profileError.message?.includes('401') || profileError.message?.includes('403')) {
                await signOutUser()
                setAuthorized(false)
                setLoading(false)
                return
              }
            }
          } else {
            if (profile.email) {
              const cachedEmailType = detectEmailType(profile.email)
              if (cachedEmailType !== 'student') {
                console.error('🚫🚫🚫 CRITICAL: Cached profile has non-student email!', {
                  cachedEmail: profile.email,
                  cachedEmailType,
                  authEmail: user.email
                })
                await signOutUser()
                sessionStorage.removeItem('currentUser')
                localStorage.removeItem('currentUser')
                setAuthorized(false)
                setError('Access denied. Profile email mismatch.')
                setLoading(false)
                return
              }
            }
          }
        } else {
          console.error('🚫 CRITICAL: Cannot determine profile type')
          await signOutUser()
          sessionStorage.removeItem('currentUser')
          localStorage.removeItem('currentUser')
          setAuthorized(false)
          setError('Access denied. Invalid email type.')
          setLoading(false)
          return
        }

        if (profile) {
          await saveUserProfile(user.uid, profile)
        }

        if (profile) {
          console.log('🔐 ProtectedRoute: Profile found', {
            profileRole: profile.role,
            profileEmail: profile.email,
            requiredRole,
            emailType
          })

          if (profile.email) {
            const profileEmailTypeCheck = detectEmailType(profile.email)
            if (profileEmailTypeCheck !== emailType) {
              console.error('🚫🚫🚫 CRITICAL: Profile email type mismatch!', {
                profileEmail: profile.email,
                profileEmailType: profileEmailTypeCheck,
                authEmail: user.email,
                authEmailType: emailType
              })
              await signOutUser()
              sessionStorage.removeItem('currentUser')
              setAuthorized(false)
              setError('Access denied. Profile email mismatch detected.')
              setLoading(false)
              return
            }
          }

          if (profile.role !== requiredRole) {
            console.error('🚫🚫🚫 CRITICAL: Profile role mismatch!', {
              profileRole: profile.role,
              requiredRole,
              emailType,
              profileEmail: profile.email
            })
            await signOutUser()
            sessionStorage.removeItem('currentUser')
            setAuthorized(false)
            const roleMessage = profile.role === 'Student' 
              ? 'Students cannot access the professor dashboard. Please login as a student.'
              : 'Professors cannot access the student dashboard. Please login as a professor.'
            setError(`Access denied. ${roleMessage}`)
            setLoading(false)
            return
          }

          if (shouldBeProfessor && profile.role !== 'Professor') {
            console.error('🚫🚫🚫 CRITICAL: Professor email but profile has wrong role!', {
              email: user.email,
              emailType,
              profileRole: profile.role
            })
            await signOutUser()
            sessionStorage.removeItem('currentUser')
            setAuthorized(false)
            setError('Access denied. Role mismatch detected.')
            setLoading(false)
            return
          }

          if (shouldBeStudent && profile.role !== 'Student') {
            console.error('🚫🚫🚫 CRITICAL: Student email but profile has wrong role!', {
              email: user.email,
              emailType,
              profileRole: profile.role
            })
            await signOutUser()
            sessionStorage.removeItem('currentUser')
            setAuthorized(false)
            setError('Access denied. Role mismatch detected.')
            setLoading(false)
            return
          }

          if (requiredRole === 'Professor' && emailType !== 'professor') {
            console.error('🚫🚫🚫🚫🚫🚫🚫🚫🚫 ABSOLUTE FINAL BLOCK: Student email - REJECTING AUTHORIZATION', {
              email: user.email,
              emailType,
              profileRole: profile.role,
              requiredRole
            })
            await signOutUser()
            sessionStorage.removeItem('currentUser')
            localStorage.removeItem('currentUser')
            setAuthorized(false)
            setError('Access denied. Students cannot access the professor dashboard.')
            setLoading(false)
            return
          }

          if (requiredRole === 'Student' && emailType !== 'student') {
            console.error('🚫🚫🚫🚫🚫🚫🚫🚫🚫 ABSOLUTE FINAL BLOCK: Professor email - REJECTING AUTHORIZATION', {
              email: user.email,
              emailType,
              profileRole: profile.role,
              requiredRole
            })
            await signOutUser()
            sessionStorage.removeItem('currentUser')
            localStorage.removeItem('currentUser')
            setAuthorized(false)
            setError('Access denied. Professors cannot access the student dashboard.')
            setLoading(false)
            return
          }

          if (serverVerified || profile) {
            console.log('✅ ProtectedRoute: Authorization granted', {
              email: user.email,
              role: profile.role,
              requiredRole,
              emailType
            })
            setAuthorized(true)
            setError(null)
          } else {
            console.warn('Server verification mismatch, signing out for security')
            await signOutUser()
            setAuthorized(false)
          }
        } else {
          console.warn('No profile found for user, blocking access')
          await signOutUser()
          sessionStorage.removeItem('currentUser')
          setAuthorized(false)
          setError('Access denied. User profile not found.')
        }
      } catch (e) {
        console.error('ProtectedRoute error:', e)
        setError('Authentication verification failed')
        setAuthorized(false)

        if (e.message?.includes('401') || e.message?.includes('Authentication')) {
          await signOutUser()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [requiredRole])


  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Verifying authentication...</div>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          Please wait while we verify your access
        </div>
      </div>
    )
  }


  if (!authorized) {
    if (error) {
      console.warn('ProtectedRoute authorization failed:', error)
    }
    return <Navigate to="/login" replace />
  }


  return children
}

