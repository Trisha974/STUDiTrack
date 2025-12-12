/**
 * Custom hook for managing enrollments
 */
import { useState, useCallback } from 'react'
import { normalizeEnrollsMap, normalizeStudentId } from '../utils/validationHelpers'
import { createEnrollment, deleteEnrollment, getEnrollmentsByCourse } from '../services/enrollments'

export function useEnrollments(profUid, onSave) {
  const [enrolls, setEnrolls] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const setNormalizedEnrolls = useCallback((nextValue) => {
    if (typeof nextValue === 'function') {
      setEnrolls(prev => normalizeEnrollsMap(nextValue(prev)))
    } else {
      setEnrolls(normalizeEnrollsMap(nextValue))
    }
  }, [])

  const loadEnrollments = useCallback(async (courseId) => {
    if (!courseId) return []
    setIsLoading(true)
    setError(null)
    try {
      const enrollments = await getEnrollmentsByCourse(courseId)
      return enrollments || []
    } catch (err) {
      console.error('Failed to load enrollments:', err)
      setError(err.message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addEnrollment = useCallback(async (courseId, studentId) => {
    if (!profUid) throw new Error('Professor UID required')
    
    try {
      await createEnrollment({
        course_id: courseId,
        student_id: studentId,
        professor_firebase_uid: profUid
      })
      
      const normalizedId = normalizeStudentId(studentId)
      setEnrolls(prev => {
        const course = prev[courseId] || []
        if (!course.includes(normalizedId)) {
          return { ...prev, [courseId]: [...course, normalizedId] }
        }
        return prev
      })
      
      if (onSave) {
        await onSave({ enrolls: { ...enrolls, [courseId]: [...(enrolls[courseId] || []), normalizedId] } })
      }
    } catch (err) {
      console.error('Failed to add enrollment:', err)
      throw err
    }
  }, [profUid, enrolls, onSave])

  const removeEnrollment = useCallback(async (courseId, studentId) => {
    try {
      await deleteEnrollment(courseId, studentId)
      
      const normalizedId = normalizeStudentId(studentId)
      setEnrolls(prev => {
        const course = prev[courseId] || []
        return { ...prev, [courseId]: course.filter(id => id !== normalizedId) }
      })
      
      if (onSave) {
        await onSave({ 
          enrolls: { 
            ...enrolls, 
            [courseId]: (enrolls[courseId] || []).filter(id => id !== normalizedId)
          }
        })
      }
    } catch (err) {
      console.error('Failed to remove enrollment:', err)
      throw err
    }
  }, [enrolls, onSave])

  const getEnrolledStudents = useCallback((subjectCode) => {
    return enrolls[subjectCode] || []
  }, [enrolls])

  return {
    enrolls,
    isLoading,
    error,
    loadEnrollments,
    addEnrollment,
    removeEnrollment,
    getEnrolledStudents,
    setEnrolls,
    setNormalizedEnrolls
  }
}

