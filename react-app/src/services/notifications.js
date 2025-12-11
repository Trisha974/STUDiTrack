// Notification service - uses Express API
import * as notificationsApi from './api/notificationsApi'

/**
 * Get all notifications for the authenticated user
 * @param {Object} options - { limit, offset, unreadOnly }
 * @returns {Promise<Array>} Array of notifications
 */
export async function getNotifications(options = {}) {
  return await notificationsApi.getNotifications(options)
}

/**
 * Get unread notification count
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount() {
  return await notificationsApi.getUnreadCount()
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification MySQL ID
 * @returns {Promise<Object>} Updated notification
 */
export async function markAsRead(notificationId) {
  return await notificationsApi.markAsRead(notificationId)
}

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} Success message
 */
export async function markAllAsRead() {
  return await notificationsApi.markAllAsRead()
}

/**
 * Delete notification
 * @param {number} notificationId - Notification MySQL ID
 * @returns {Promise<Object>} Success message
 */
export async function deleteNotification(notificationId) {
  return await notificationsApi.deleteNotification(notificationId)
}

/**
 * Subscribe to notifications using polling
 * @param {Function} callback - Callback function that receives array of notifications
 * @param {Object} options - { limit, unreadOnly }
 * @returns {Function} Unsubscribe function
 */
export function subscribeToNotifications(callback, options = {}) {
  return notificationsApi.subscribeToNotifications(callback, options)
}


