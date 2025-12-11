// API service for notifications
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

  const endpoint = queryParams.toString()
    ? `/notifications?${queryParams.toString()}`
    : '/notifications'

  return apiClient.get(endpoint)
}

/**
 * Get unread notification count
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount() {
  const response = await apiClient.get('/notifications/unread/count')
  return response.count || 0
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

  const poll = async () => {
    try {
      const notifications = await getNotifications(options)
      callback(notifications)
    } catch (error) {
      console.error('Error polling notifications:', error)
      callback([])
    }
  }

  poll() // Initial fetch
  intervalId = setInterval(poll, 5000) // Poll every 5 seconds

  return () => {
    if (intervalId) clearInterval(intervalId)
  }
}


