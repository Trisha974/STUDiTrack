/**
 * Authentication Helper Utilities
 * Centralized functions for user authentication and session management
 */

import { auth } from '../firebase'
import { TIMEOUTS } from '../constants/appConstants'

/**
 * Get current user UID from multiple sources
 * @param {string} uidOverride - Optional UID override
 * @returns {Promise<string|null>} User UID or null
 */
export async function getCurrentUserUid(uidOverride = null) {
  if (uidOverride) return uidOverride

  if (auth?.currentUser?.uid) {
    return auth.currentUser.uid
  }

  try {
    const currentUser = sessionStorage.getItem('currentUser')
    if (currentUser) {
      const userData = JSON.parse(currentUser)
      if (userData?.uid) {
        return userData.uid
      }
    }
  } catch (e) {
    console.warn('Could not get UID from sessionStorage', e)
  }

  return null
}

/**
 * Get current user data from sessionStorage
 * @returns {Object|null} User data object or null
 */
export function getCurrentUserData() {
  try {
    const currentUser = sessionStorage.getItem('currentUser')
    if (currentUser) {
      return JSON.parse(currentUser)
    }
  } catch (e) {
    console.warn('Failed to parse current user from session', e)
  }
  return null
}

/**
 * Wait for Firebase auth user to be available
 * @param {number} timeout - Maximum wait time in milliseconds
 * @returns {Promise<Object|null>} Firebase user or null
 */
export function waitForAuthUser(timeout = TIMEOUTS.AUTH_TIMEOUT) {
  return new Promise((resolve) => {
    if (auth?.currentUser) {
      resolve(auth.currentUser)
      return
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe()
      resolve(user || null)
    })

    setTimeout(() => {
      unsubscribe()
      resolve(null)
    }, timeout)
  })
}

/**
 * Update sessionStorage with user data
 * @param {Object} userData - User data object
 */
export function updateSessionUser(userData) {
  try {
    sessionStorage.setItem('currentUser', JSON.stringify(userData))
  } catch (e) {
    console.warn('Failed to update session user', e)
  }
}

/**
 * Clear session user data
 */
export function clearSessionUser() {
  try {
    sessionStorage.removeItem('currentUser')
  } catch (e) {
    console.warn('Failed to clear session user', e)
  }
}

/**
 * Update specific fields in session user data
 * @param {Object} updates - Fields to update
 */
export function updateSessionUserFields(updates) {
  try {
    const currentData = getCurrentUserData()
    if (currentData) {
      const updated = { ...currentData, ...updates }
      updateSessionUser(updated)
    }
  } catch (e) {
    console.warn('Failed to update session user fields', e)
  }
}

