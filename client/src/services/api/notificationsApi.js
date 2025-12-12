import apiClient from './apiClient'

/**
 * Get all notifications for the authenticated user
 * @param {Object} options - { limit, offset, unreadOnly }
 * @returns {Promise<Array>} Array of notifications
 */
export async function getNotifications(options = {}) {
  const queryParams = new URLSearchParams()
  if (options.limit) queryParams.append('limit', options.limit)
  if (options.offset) queryParams.append('offset', options.offset)
  if (options.unreadOnly) queryParams.append('unreadOnly', 'true')
  if (options.studentId) {
    queryParams.append('student_id', options.studentId)
  }

  const endpoint = queryParams.toString()
    ? `/notifications?${queryParams.toString()}`
    : '/notifications'

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const fullUrl = `${API_BASE_URL}${endpoint}`
  
  console.log('📬 Fetching notifications from:', fullUrl)
  console.log('📬 API configuration:', {
    apiBaseUrl: API_BASE_URL,
    endpoint,
    fullUrl,
    envVar: import.meta.env.VITE_API_URL || 'not set (using default)'
  })
  
  try {
    const result = await apiClient.get(endpoint)
    
    console.log('📬 Notifications API response (raw):', {
      type: typeof result,
      isArray: Array.isArray(result),
      length: Array.isArray(result) ? result.length : 'N/A',
      hasData: !!result,
      dataType: result ? typeof result : 'null',
      isObject: result && typeof result === 'object' && !Array.isArray(result),
      keys: result && typeof result === 'object' && !Array.isArray(result) ? Object.keys(result) : null,
      fullResponse: result,
      stringified: JSON.stringify(result).substring(0, 1000),
      firstItem: Array.isArray(result) && result.length > 0 ? result[0] : null,
      hasDebug: result && typeof result === 'object' && !Array.isArray(result) && result._debug ? true : false,
      debugInfo: result && typeof result === 'object' && !Array.isArray(result) && result._debug ? result._debug : null
    })
    
    if (result && typeof result === 'object' && !Array.isArray(result) && result._debug) {
      console.error('❌❌❌ NOTIFICATIONS DEBUG INFO RECEIVED ❌❌❌')
      console.error('❌ Backend debug info:', result._debug)
      console.error('❌ Backend resolved student MySQL ID:', result._debug.studentMySQLId)
      console.error('❌ Frontend expects student MySQL ID: 25')
      if (result._debug.studentMySQLId !== 25) {
        console.error('❌❌❌ MISMATCH DETECTED! ❌❌❌')
        console.error('❌ Backend found student ID:', result._debug.studentMySQLId)
        console.error('❌ Frontend expects student ID: 25')
        console.error('❌ This is why notifications are not showing!')
        console.error('❌ The backend is resolving a different student than the frontend expects.')
        console.error('❌ Check backend server console logs to see which Firebase UID was used.')
      }
      return result.notifications || []
    }
    
    if (result && typeof result === 'object' && !Array.isArray(result) && result._debug) {
      console.warn('⚠️ [NOTIFICATIONS] Backend returned debug info:', result._debug)
      console.warn('⚠️ [NOTIFICATIONS] This means no notifications were found for the resolved student')
      console.warn('⚠️ [NOTIFICATIONS] Student MySQL ID used by backend:', result._debug.studentMySQLId)
      console.warn('⚠️ [NOTIFICATIONS] Frontend thinks student MySQL ID is: 25')
      if (result._debug.studentMySQLId !== 25) {
        console.error('❌ [NOTIFICATIONS] MISMATCH! Backend resolved different student ID!')
        console.error('❌ [NOTIFICATIONS] Backend student ID:', result._debug.studentMySQLId)
        console.error('❌ [NOTIFICATIONS] Frontend student ID: 25')
        console.error('❌ [NOTIFICATIONS] This is why notifications are not showing!')
      }
      return result.notifications || []
    }
    
    if (Array.isArray(result)) {
      console.log(`✅ Notifications API returned direct array with ${result.length} items`)
      if (result.length > 0) {
        console.log(`✅ First notification:`, {
          id: result[0].id,
          title: result[0].title,
          user_id: result[0].user_id,
          user_type: result[0].user_type
        })
      } else {
        console.warn('⚠️ [NOTIFICATIONS] Backend returned empty array')
        console.warn('⚠️ [NOTIFICATIONS] Check backend server console logs to see which student ID was resolved')
      }
      return result
    }
    
    if (Array.isArray(result)) {
      console.log('✅ Response is direct array, returning', result.length, 'notifications')
      return result
    }
    
    if (result && typeof result === 'object' && !Array.isArray(result)) {
      const keys = Object.keys(result)
      console.log('🔍 Response is object with keys:', keys)
      
      for (const key of ['data', 'notifications', 'items', 'results', 'list', 'array']) {
        if (Array.isArray(result[key])) {
          console.log(`✅ Found notifications in result.${key}, returning`, result[key].length, 'notifications')
          return result[key]
        }
      }
      
      for (const key of keys) {
        if (Array.isArray(result[key])) {
          console.log(`✅ Found array in result.${key}, returning`, result[key].length, 'items')
          return result[key]
        }
      }
      
      if (keys.every(k => !isNaN(parseInt(k)))) {
        const arrayFromObject = Object.values(result)
        if (arrayFromObject.length > 0) {
          console.log('✅ Converted object with numeric keys to array, returning', arrayFromObject.length, 'items')
          return arrayFromObject
        }
      }
      
      if (keys.length === 1 && Array.isArray(result[keys[0]])) {
        console.log(`✅ Found single array property ${keys[0]}, returning`, result[keys[0]].length, 'items')
        return result[keys[0]]
      }
      
      console.error('❌ Response is object but no array found in any property!')
      console.error('❌ Object keys:', keys)
      console.error('❌ Object values:', Object.values(result).map(v => ({ type: typeof v, isArray: Array.isArray(v) })))
      console.error('❌ Full response:', JSON.stringify(result, null, 2))
    }
    
    console.error('❌ Unexpected notifications response format!')
    console.error('❌ Response type:', typeof result)
    console.error('❌ Response value:', result)
    console.error('❌ Full response stringified:', JSON.stringify(result, null, 2).substring(0, 1000))
    
    if (result && typeof result === 'object' && result.error) {
      console.error('❌ API returned error:', result.error)
      throw new Error(result.error)
    }
    
    return []
  } catch (error) {
    console.error('❌ Error fetching notifications:', error)
    console.error('❌ Error details:', {
      message: error.message,
      endpoint,
      fullUrl,
      apiBaseUrl: API_BASE_URL,
      stack: error.stack
    })
    
    if (error.message.includes('Cannot connect to server')) {
      console.error('💡 Troubleshooting tips:')
      console.error('   1. Check if backend server is running: cd server && npm start')
      console.error('   2. Verify API URL in .env file: VITE_API_URL=http://localhost:5000/api')
      console.error('   3. Check CORS settings in server/src/server.js')
      console.error('   4. Verify server is listening on port 5000')
    }
    
    throw error
  }
}

/**
 * Get unread notification count
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount() {
  const response = await apiClient.get('/notifications/unread/count')
  
  if (typeof response === 'number') {
    return response
  }
  if (response && typeof response === 'object') {
    return response.count || response.unreadCount || response.total || 0
  }
  return 0
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification MySQL ID
 * @returns {Promise<Object>} Updated notification
 */
export async function markAsRead(notificationId) {
  return apiClient.put(`/notifications/${notificationId}/read`)
}

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Success message
 */
export async function markAllAsRead() {
  return apiClient.put('/notifications/read-all')
}

/**
 * Delete notification
 * @param {number} notificationId - Notification MySQL ID
 * @returns {Promise<Object>} Success message
 */
export async function deleteNotification(notificationId) {
  return apiClient.delete(`/notifications/${notificationId}`)
}

/**
 * Subscribe to notifications using polling
 * @param {Function} callback - Callback function that receives array of notifications
 * @param {Object} options - { limit, unreadOnly }
 * @returns {Function} Unsubscribe function
 */
export function subscribeToNotifications(callback, options = {}) {
  let intervalId = null
  let lastNotifications = []

  const poll = async () => {
    try {
      const notifications = await getNotifications(options)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📬 Polling notifications - API response:', {
          type: typeof notifications,
          isArray: Array.isArray(notifications),
          length: Array.isArray(notifications) ? notifications.length : 'N/A'
        })
      }
      
      if (Array.isArray(notifications)) {
        lastNotifications = notifications
        if (notifications.length > 0 && process.env.NODE_ENV === 'development') {
          console.log(`✅ Setting ${notifications.length} notifications from API`)
        }
        callback(notifications)
      } else if (notifications && typeof notifications === 'object') {
        const notificationsArray = notifications.data || notifications.notifications || []
        if (Array.isArray(notificationsArray)) {
          lastNotifications = notificationsArray
          if (notificationsArray.length > 0 && process.env.NODE_ENV === 'development') {
            console.log(`✅ Setting ${notificationsArray.length} notifications from wrapped response`)
          }
          callback(notificationsArray)
        } else {
          console.warn('⚠️ Notifications API returned object but no array found:', notifications)
          if (lastNotifications.length > 0) {
            callback(lastNotifications)
          }
        }
      } else {
        console.warn('⚠️ Notifications API returned non-array:', notifications)
        if (lastNotifications.length > 0) {
          callback(lastNotifications)
        }
      }
    } catch (error) {
      console.error('❌ Error polling notifications:', error)
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      })
      
      if (lastNotifications.length > 0) {
        console.log(`⚠️ Using cached notifications (${lastNotifications.length} items) due to error`)
        callback(lastNotifications)
      } else {
        if (error.response?.status === 404) {
          console.warn('⚠️ Student profile not found (404) - cannot load notifications')
          callback([])
        } else {
          console.warn('⚠️ Notification polling error, but no cached data available. Will retry on next poll.')
        }
      }
    }
  }

  poll()
  intervalId = setInterval(poll, 5000)

  return () => {
    if (intervalId) clearInterval(intervalId)
  }
}


