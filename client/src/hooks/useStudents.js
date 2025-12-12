/**
 * Custom hook for managing students
 */
import { useState, useCallback, useMemo } from 'react'
import { normalizeStudentId } from '../utils/validationHelpers'

export function useStudents(onSave) {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const studentsById = useMemo(() => {
    const map = {}
    students.forEach(student => {
      const key = normalizeStudentId(student.id)
      if (key) {
        map[key] = student
      }
    })
    return map
  }, [students])

  const addStudent = useCallback(async (studentData) => {
    const newStudent = {
      ...studentData,
      id: normalizeStudentId(studentData.id)
    }
    
    setStudents(prev => {
      const exists = prev.find(s => normalizeStudentId(s.id) === newStudent.id)
      if (exists) {
        throw new Error('Student with this ID already exists')
      }
      return [...prev, newStudent]
    })
    
    if (onSave) {
      await onSave({ students: [...students, newStudent] })
    }
    
    return newStudent
  }, [students, onSave])

  const updateStudent = useCallback(async (studentId, updates) => {
    const normalizedId = normalizeStudentId(studentId)
    setStudents(prev => prev.map(s => 
      normalizeStudentId(s.id) === normalizedId ? { ...s, ...updates } : s
    ))
    
    if (onSave) {
      await onSave({ 
        students: students.map(s => 
          normalizeStudentId(s.id) === normalizedId ? { ...s, ...updates } : s
        )
      })
    }
  }, [students, onSave])

  const deleteStudent = useCallback(async (studentId) => {
    const normalizedId = normalizeStudentId(studentId)
    setStudents(prev => prev.filter(s => normalizeStudentId(s.id) !== normalizedId))
    
    if (onSave) {
      await onSave({ 
        students: students.filter(s => normalizeStudentId(s.id) !== normalizedId)
      })
    }
  }, [students, onSave])

  const archiveStudent = useCallback(async (studentId, subjectCode) => {
    const normalizedId = normalizeStudentId(studentId)
    setStudents(prev => prev.map(s => {
      if (normalizeStudentId(s.id) === normalizedId) {
        const archivedSubjects = s.archivedSubjects || []
        if (!archivedSubjects.includes(subjectCode)) {
          return { ...s, archivedSubjects: [...archivedSubjects, subjectCode] }
        }
      }
      return s
    }))
    
    if (onSave) {
      await onSave({ students: students.map(s => {
        if (normalizeStudentId(s.id) === normalizedId) {
          const archivedSubjects = s.archivedSubjects || []
          if (!archivedSubjects.includes(subjectCode)) {
            return { ...s, archivedSubjects: [...archivedSubjects, subjectCode] }
          }
        }
        return s
      })})
    }
  }, [students, onSave])

  const unarchiveStudent = useCallback(async (studentId, subjectCode) => {
    const normalizedId = normalizeStudentId(studentId)
    setStudents(prev => prev.map(s => {
      if (normalizeStudentId(s.id) === normalizedId) {
        return {
          ...s,
          archivedSubjects: (s.archivedSubjects || []).filter(code => code !== subjectCode)
        }
      }
      return s
    }))
    
    if (onSave) {
      await onSave({ students: students.map(s => {
        if (normalizeStudentId(s.id) === normalizedId) {
          return {
            ...s,
            archivedSubjects: (s.archivedSubjects || []).filter(code => code !== subjectCode)
          }
        }
        return s
      })})
    }
  }, [students, onSave])

  const getStudentById = useCallback((studentId) => {
    return studentsById[normalizeStudentId(studentId)]
  }, [studentsById])

  return {
    students,
    studentsById,
    isLoading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    archiveStudent,
    unarchiveStudent,
    getStudentById,
    setStudents
  }
}

