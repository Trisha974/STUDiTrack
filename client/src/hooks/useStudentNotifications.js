import { useCallback } from 'react'
import { getNotifications, getUnreadCount } from '../services/notifications'

/**
 * Hook for Student.jsx notification handling logic
 * Extracts refreshNotifications function to reduce Student.jsx size (~200 lines)
 */
export function useStudentNotifications({
  studentMySQLId,
  setNotifications,
  setUnreadNotificationCount
}) {
  const refreshNotifications = useCallback(async () => {
    if (!studentMySQLId) {
      console.warn('⚠️ Cannot refresh notifications: studentMySQLId not set')
      return
    }
    

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    try {

      const healthCheck = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`)
      if (!healthCheck.ok) {
        throw new Error(`Server health check failed: ${healthCheck.status}`)
      }
    } catch (healthError) {
      console.error('❌ Server connection test failed:', healthError)
      console.error('💡 Please ensure the backend server is running:')
      console.error('   1. Open a terminal in the server directory')
      console.error('   2. Run: npm start (or npm run dev)')
      console.error('   3. Verify server is running on http://localhost:5000')
      console.error(`   4. Check API URL: ${API_BASE_URL}`)
      return
    }
    
    try {
      let notificationsData = []
      let unreadCountResponse = 0
      
      try {
        notificationsData = await getNotifications({ limit: 50, studentId: studentMySQLId })
        
        if (Array.isArray(notificationsData) && notificationsData.length === 0) {
          console.warn('⚠️ getNotifications returned empty array. Check server logs to see which student ID was resolved.')
        }
      } catch (notifError) {
        console.error('❌ Error calling getNotifications:', notifError)
        notificationsData = []
      }
      
      try {
        unreadCountResponse = await getUnreadCount()
      } catch (countError) {
        console.error('❌ Error calling getUnreadCount:', countError)
        unreadCountResponse = 0
      }
      

      const unreadCount = typeof unreadCountResponse === 'number' 
        ? unreadCountResponse 
        : (unreadCountResponse?.count || 0)
      

      let notificationsArray = []
      if (Array.isArray(notificationsData)) {
        notificationsArray = notificationsData
      } else if (notificationsData && typeof notificationsData === 'object') {

        const keys = Object.keys(notificationsData)
        const commonKeys = ['data', 'notifications', 'items', 'results', 'list', 'array', 'notificationsList']
        let found = false
        
        for (const key of commonKeys) {
          if (Array.isArray(notificationsData[key])) {
            notificationsArray = notificationsData[key]
            found = true
            break
          }
        }
        

        if (!found) {
          for (const key of keys) {
            if (Array.isArray(notificationsData[key])) {
              notificationsArray = notificationsData[key]
              found = true
              break
            }
          }
        }
        

        if (!found && keys.length > 0) {
          const firstValue = notificationsData[keys[0]]
          if (Array.isArray(firstValue)) {
            notificationsArray = firstValue
            found = true
          } else if (typeof firstValue === 'object' && firstValue !== null) {
            const values = Object.values(notificationsData)
            if (values.every(v => typeof v === 'object' && v !== null && !Array.isArray(v))) {
              notificationsArray = values
              found = true
            }
          }
        }
        
        if (!found) {
          console.error('❌ Notifications response is object but no array found!')
          console.error('❌ Response keys:', keys)
        }
      } else if (notificationsData === null || notificationsData === undefined) {
        console.error('❌ Notifications response is null or undefined!')
      } else {
        console.error('❌ Unexpected notifications response type:', typeof notificationsData, notificationsData)
      }
      

      if (unreadCount > 0 && notificationsArray.length === 0) {
        console.error('❌ CRITICAL MISMATCH: Badge shows', unreadCount, 'unread but notifications array is empty!')
        console.error('❌ Student MySQL ID used:', studentMySQLId)
        

        if (notificationsData && typeof notificationsData === 'object' && !Array.isArray(notificationsData)) {
          const keys = Object.keys(notificationsData)
          for (const key of keys) {
            const value = notificationsData[key]
            if (Array.isArray(value)) {
              notificationsArray = value
              const finalNotificationsArray = Array.isArray(notificationsArray) ? notificationsArray : []
              setNotifications(finalNotificationsArray)
              const calculatedUnread = finalNotificationsArray.filter(n => !n.read || n.read === 0).length
              setUnreadNotificationCount(calculatedUnread)
              return
            }
          }
        }
        
        console.error('💡 Check server logs for: "📬 Found X notifications for Student ID"')
        console.error('💡 This mismatch suggests the API returned empty array despite unread count > 0')
      }
      

      const finalNotificationsArray = Array.isArray(notificationsArray) ? notificationsArray : []
      

      setNotifications(finalNotificationsArray)
      

      const calculatedUnread = finalNotificationsArray.filter(n => {
        const readValue = n.read
        return readValue === false || readValue === 0 || readValue === '0' || readValue === null || readValue === undefined
      }).length
      

      const finalUnreadCount = notificationsArray.length > 0 ? calculatedUnread : unreadCount
      
      setUnreadNotificationCount(finalUnreadCount)
    } catch (error) {
      console.error('❌ Error manually refreshing notifications:', error)
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
    }
  }, [studentMySQLId, setNotifications, setUnreadNotificationCount])

  return {
    refreshNotifications
  }
}

