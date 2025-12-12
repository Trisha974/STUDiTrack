/**
 * Custom hook for managing attendance
 */
import { useState, useCallback } from 'react'
import { setAttendanceForDate } from '../services/attendance'
import { ATTENDANCE_STATUS } from '../constants/appConstants'

export function useAttendance(onSave) {
  const [records, setRecords] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const markAttendance = useCallback(async (courseId, date, studentId, status) => {
    try {
      await setAttendanceForDate({
        course_id: courseId,
        date,
        student_id: studentId,
        status
      })
      
      const key = `${courseId}-${date}`
      setRecords(prev => {
        const dayRecords = prev[key] || {}
        return {
          ...prev,
          [key]: {
            ...dayRecords,
            [studentId]: status
          }
        }
      })
      
      if (onSave) {
        await onSave({ 
          records: {
            ...records,
            [key]: {
              ...(records[key] || {}),
              [studentId]: status
            }
          }
        })
      }
    } catch (err) {
      console.error('Failed to mark attendance:', err)
      throw err
    }
  }, [records, onSave])

  const getAttendanceForDate = useCallback((courseId, date) => {
    const key = `${courseId}-${date}`
    return records[key] || {}
  }, [records])

  return {
    records,
    isLoading,
    error,
    markAttendance,
    getAttendanceForDate,
    setRecords
  }
}

