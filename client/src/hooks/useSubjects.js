/**
 * Custom hook for managing subjects
 */
import { useState, useCallback, useMemo } from 'react'
import { createCourse, getCoursesByProfessor, deleteCourse, updateCourse } from '../services/courses'
import { DASHBOARD_COLLECTION } from '../constants/appConstants'
import { useAsyncState } from './useAsyncState'

export function useSubjects(profUid, onSave, addCustomAlert) {
  const [subjects, setSubjects] = useState([])
  const [removedSubjects, setRemovedSubjects] = useState([])
  const [recycleBinSubjects, setRecycleBinSubjects] = useState([])
  const asyncState = useAsyncState(addCustomAlert)

  const loadSubjects = useCallback(async (uid) => {
    if (!uid) return

    return asyncState.executeAsync(
      async () => {
        const courses = await getCoursesByProfessor(uid)
        setSubjects(courses || [])
        return courses
      },
      { errorMessage: 'Failed to load subjects' }
    )
  }, [asyncState])

  const addSubject = useCallback(async (subjectData) => {
    if (!profUid) throw new Error('Professor UID required')
    
    try {
      const newCourse = await createCourse({
        ...subjectData,
        professor_firebase_uid: profUid
      })
      
      setSubjects(prev => [...prev, newCourse])
      

      if (onSave) {
        await onSave({ subjects: [...subjects, newCourse] })
      }
      
      return newCourse
    } catch (err) {
      console.error('Failed to add subject:', err)
      throw err
    }
  }, [profUid, subjects, onSave])

  const updateSubject = useCallback(async (courseId, updates) => {
    try {
      const updated = await updateCourse(courseId, updates)
      setSubjects(prev => prev.map(s => s.id === courseId ? updated : s))
      
      if (onSave) {
        await onSave({ subjects: subjects.map(s => s.id === courseId ? updated : s) })
      }
      
      return updated
    } catch (err) {
      console.error('Failed to update subject:', err)
      throw err
    }
  }, [subjects, onSave])

  const archiveSubject = useCallback(async (subjectCode) => {
    const subject = subjects.find(s => s.code === subjectCode)
    if (!subject) return

    setSubjects(prev => prev.filter(s => s.code !== subjectCode))
    setRemovedSubjects(prev => [...prev, subject])
    
    if (onSave) {
      await onSave({ 
        subjects: subjects.filter(s => s.code !== subjectCode),
        removedSubjects: [...removedSubjects, subject]
      })
    }
  }, [subjects, removedSubjects, onSave])

  const deleteSubject = useCallback(async (courseId) => {
    try {
      await deleteCourse(courseId)
      const subject = subjects.find(s => s.id === courseId)
      
      setSubjects(prev => prev.filter(s => s.id !== courseId))
      setRecycleBinSubjects(prev => [...prev, subject])
      
      if (onSave) {
        await onSave({ subjects: subjects.filter(s => s.id !== courseId) })
      }
    } catch (err) {
      console.error('Failed to delete subject:', err)
      throw err
    }
  }, [subjects, onSave])

  const restoreSubject = useCallback(async (subject) => {
    setRemovedSubjects(prev => prev.filter(s => s.code !== subject.code))
    setSubjects(prev => [...prev, subject])
    
    if (onSave) {
      await onSave({ 
        subjects: [...subjects, subject],
        removedSubjects: removedSubjects.filter(s => s.code !== subject.code)
      })
    }
  }, [subjects, removedSubjects, onSave])

  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {

      return true
    })
  }, [subjects])

  return {
    subjects,
    removedSubjects,
    recycleBinSubjects,
    isLoading: asyncState.isLoading,
    error: asyncState.error,
    loadSubjects,
    addSubject,
    updateSubject,
    archiveSubject,
    deleteSubject,
    restoreSubject,
    filteredSubjects,
    setSubjects,
    setRemovedSubjects,
    setRecycleBinSubjects
  }
}

