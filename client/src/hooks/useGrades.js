/**
 * Custom hook for managing grades
 */
import { useState, useCallback } from 'react'
import { createGrade } from '../services/grades'
import { ASSESSMENT_TYPES } from '../constants/appConstants'

export function useGrades(onSave) {
  const [grades, setGrades] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const addGrade = useCallback(async (courseId, gradeData) => {
    try {
      const newGrade = await createGrade({
        course_id: courseId,
        ...gradeData
      })
      
      const subjectCode = gradeData.subjectCode || courseId
      setGrades(prev => {
        const subjectGrades = prev[subjectCode] || {}
        const typeGrades = subjectGrades[gradeData.type] || []
        return {
          ...prev,
          [subjectCode]: {
            ...subjectGrades,
            [gradeData.type]: [...typeGrades, newGrade]
          }
        }
      })
      
      if (onSave) {
        await onSave({ 
          grades: {
            ...grades,
            [subjectCode]: {
              ...(grades[subjectCode] || {}),
              [gradeData.type]: [...((grades[subjectCode]?.[gradeData.type] || [])), newGrade]
            }
          }
        })
      }
      
      return newGrade
    } catch (err) {
      console.error('Failed to add grade:', err)
      throw err
    }
  }, [grades, onSave])

  const getGradesForSubject = useCallback((subjectCode, type = null) => {
    const subjectGrades = grades[subjectCode] || {}
    if (type) {
      return subjectGrades[type] || []
    }
    return subjectGrades
  }, [grades])

  return {
    grades,
    isLoading,
    error,
    addGrade,
    getGradesForSubject,
    setGrades
  }
}

