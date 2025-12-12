/**
 * Authentication and authorization guard hook
 * Handles route protection, role-based access, and authentication state
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { auth, onAuthStateChanged } from '../firebase'
import { USER_ROLES, ROLE_LEVELS } from '../constants/appConstants'
import { getCurrentUserData, updateSessionUserFields } from '../utils/authHelpers'

export function useAuthGuard({
  requiredRole = null,
  requireAuth = true,
  redirectTo = '/login',
  fallbackComponent = null
} = {}) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasRequiredRole, setHasRequiredRole] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()

  /**
   * Check if user has required role
   */
  const checkRoleAccess = useCallback((userData, requiredRole) => {
    if (!requiredRole) return true
    if (!userData || !userData.role) return false

    const userRole = userData.role
    const userLevel = ROLE_LEVELS[userRole] || 0
    const requiredLevel = ROLE_LEVELS[requiredRole] || ROLE_LEVELS.DEFAULT

    return userLevel >= requiredLevel
  }, [])

  /**
   * Handle authentication state changes
   */
  useEffect(() => {
    let mounted = true

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return

      try {
        setIsLoading(true)
        setError(null)

        if (firebaseUser) {

          setUser(firebaseUser)
          setIsAuthenticated(true)


          const userData = await getCurrentUserData()
          setUserProfile(userData)


          const hasAccess = checkRoleAccess(userData, requiredRole)
          setHasRequiredRole(hasAccess)


          updateSessionUserFields({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData?.name || firebaseUser.displayName,
            role: userData?.role
          })


          if (location.pathname === '/login' && hasAccess) {
            const intendedPath = new URLSearchParams(location.search).get('redirect') || '/'
            navigate(intendedPath, { replace: true })
          }

        } else {

          setUser(null)
          setUserProfile(null)
          setIsAuthenticated(false)
          setHasRequiredRole(false)


          if (requireAuth && location.pathname !== '/login') {
            const redirectPath = `${location.pathname}${location.search}`
            navigate(`${redirectTo}?redirect=${encodeURIComponent(redirectPath)}`, { replace: true })
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setError(error.message)
        setIsAuthenticated(false)
        setHasRequiredRole(false)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [navigate, location, requiredRole, requireAuth, redirectTo, checkRoleAccess])

  /**
   * Check if access is allowed
   */
  const hasAccess = useMemo(() => {
    if (!requireAuth) return true
    if (!isAuthenticated) return false
    if (requiredRole && !hasRequiredRole) return false
    return true
  }, [requireAuth, isAuthenticated, requiredRole, hasRequiredRole])

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      await auth.signOut()

    } catch (error) {
      console.error('Sign out error:', error)
      setError(error.message)
    }
  }, [])

  /**
   * Refresh user profile data
   */
  const refreshProfile = useCallback(async () => {
    if (!user) return

    try {
      const userData = await getCurrentUserData()
      setUserProfile(userData)
      setHasRequiredRole(checkRoleAccess(userData, requiredRole))
    } catch (error) {
      console.error('Profile refresh error:', error)
      setError(error.message)
    }
  }, [user, requiredRole, checkRoleAccess])

  /**
   * Get user permissions based on role
   */
  const permissions = useMemo(() => {
    if (!userProfile?.role) return {}

    const role = userProfile.role

    return {
      canManageStudents: [USER_ROLES.PROFESSOR, USER_ROLES.ADMIN].includes(role),
      canManageSubjects: [USER_ROLES.PROFESSOR, USER_ROLES.ADMIN].includes(role),
      canViewAllGrades: [USER_ROLES.PROFESSOR, USER_ROLES.ADMIN].includes(role),
      canManageSystem: [USER_ROLES.ADMIN].includes(role),
      canAccessAdminPanel: [USER_ROLES.ADMIN].includes(role),
      isStudent: role === USER_ROLES.STUDENT,
      isProfessor: role === USER_ROLES.PROFESSOR,
      isAdmin: role === USER_ROLES.ADMIN
    }
  }, [userProfile?.role])

  /**
   * Guard component for protecting routes
   */
  const AuthGuard = useCallback(({ children, fallback = fallbackComponent }) => {

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#7A1315]"></div>
        </div>
      )
    }


    if (!hasAccess) {
      if (fallback) {
        return fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {isAuthenticated ? 'Access Denied' : 'Authentication Required'}
            </h1>
            <p className="text-gray-600 mb-8">
              {isAuthenticated
                ? `You don't have permission to access this page. Required role: ${requiredRole}`
                : 'Please sign in to access this page.'
              }
            </p>
            <button
              onClick={() => navigate(isAuthenticated ? '/' : '/login')}
              className="bg-[#7A1315] text-white px-6 py-2 rounded-lg hover:bg-[#8B1A1D] transition-colors"
            >
              {isAuthenticated ? 'Go Home' : 'Sign In'}
            </button>
          </div>
        </div>
      )
    }


    return children
  }, [isLoading, hasAccess, fallbackComponent, isAuthenticated, requiredRole, navigate])

  /**
   * Higher-order component for protecting routes
   */
  const withAuthGuard = useCallback((WrappedComponent, guardOptions = {}) => {
    return function GuardedComponent(props) {
      const options = { ...guardOptions, requiredRole, requireAuth, redirectTo, fallbackComponent }

      return (
        <useAuthGuard {...options}>
          <WrappedComponent {...props} />
        </useAuthGuard>
      )
    }
  }, [requiredRole, requireAuth, redirectTo, fallbackComponent])

  return {

    user,
    userProfile,
    isLoading,
    isAuthenticated,
    hasRequiredRole,
    hasAccess,
    error,


    signOut,
    refreshProfile,


    permissions,


    AuthGuard,
    withAuthGuard,


    checkRoleAccess: (userData) => checkRoleAccess(userData, requiredRole)
  }
}

/**
 * Hook for role-based access control checks
 */
export function useRBAC() {
  const { userProfile, permissions, checkRoleAccess } = useAuthGuard({ requireAuth: false })

  return {
    user: userProfile,
    permissions,
    hasRole: (role) => checkRoleAccess(userProfile, role),
    hasAnyRole: (roles) => roles.some(role => checkRoleAccess(userProfile, role)),
    hasAllRoles: (roles) => roles.every(role => checkRoleAccess(userProfile, role)),
    canAccess: (requiredPermissions) => {
      return requiredPermissions.every(permission => permissions[permission])
    }
  }
}

/**
 * Hook for authentication state only (no guards)
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setIsLoading(true)
        setError(null)

        if (firebaseUser) {
          setUser(firebaseUser)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth error:', error)
        setError(error.message)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const signOut = useCallback(async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
      setError(error.message)
    }
  }, [])

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signOut
  }
}