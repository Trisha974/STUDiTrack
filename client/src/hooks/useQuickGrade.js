/**
 * Custom hook for managing quick grade functionality
 * Handles quick grade entry, validation, and saving logic
 */
import { useState, useCallback } from 'react'
import { createGrade } from '../services/grades'
import { ALERT_TYPES, TIMEOUTS } from '../constants/appConstants'

export function useQuickGrade() {

  const [quickGradeType, setQuickGradeType] = useState('quiz')
  const [quickGradeTitle, setQuickGradeTitle] = useState('')
  const [quickGradeMaxPoints, setQuickGradeMaxPoints] = useState('')
  const [quickGradeDueDate, setQuickGradeDueDate] = useState('')
  const [showQuickGradeGrid, setShowQuickGradeGrid] = useState(false)
  const [quickGradeScores, setQuickGradeScores] = useState({})


  const [showFillScoreModal, setShowFillScoreModal] = useState(false)
  const [fillScoreValue, setFillScoreValue] = useState('')


  const [isSavingGrades, setIsSavingGrades] = useState(false)
  const [gradesSaveStatus, setGradesSaveStatus] = useState(null)

  /**
   * Initialize quick grade grid for a subject
   */
  const handleInitQuickGrade = useCallback((enrolls, currentSubject) => {
    if (!quickGradeTitle || !quickGradeMaxPoints) {
      return { success: false, error: 'Please enter a title and max points for the assessment.' }
    }

    const enrolled = enrolls[currentSubject?.code] || []
    const initialScores = {}
    enrolled.forEach(id => {
      initialScores[id] = ''
    })

    setQuickGradeScores(initialScores)
    setShowQuickGradeGrid(true)

    return { success: true }
  }, [quickGradeTitle, quickGradeMaxPoints])

  /**
   * Show fill all scores modal
   */
  const handleFillAllGrades = useCallback(() => {
    setFillScoreValue('')
    setShowFillScoreModal(true)
  }, [])

  /**
   * Submit fill all scores
   */
  const handleFillScoreSubmit = useCallback((enrolls, currentSubject) => {
    const score = parseFloat(fillScoreValue)
    if (isNaN(score) || score < 0) {
      return { success: false, error: 'Please enter a valid score.' }
    }

    const enrolled = enrolls[currentSubject?.code] || []
    const updatedScores = { ...quickGradeScores }
    enrolled.forEach(id => {
      updatedScores[id] = score.toString()
    })

    setQuickGradeScores(updatedScores)
    setShowFillScoreModal(false)
    setFillScoreValue('')

    return { success: true }
  }, [fillScoreValue, quickGradeScores])

  /**
   * Cancel fill all scores
   */
  const handleFillScoreCancel = useCallback(() => {
    setShowFillScoreModal(false)
    setFillScoreValue('')
  }, [])

  /**
   * Save all quick grades
   */
  const handleSaveAllGrades = useCallback(async (
    currentSubject,
    enrolls,
    grades,
    setGrades,
    addCustomAlert,
    profUid
  ) => {
    setIsSavingGrades(true)
    setGradesSaveStatus('saving')

    try {
      if (!quickGradeTitle || !quickGradeTitle.trim()) {
        throw new Error('Assessment title is required')
      }

      const maxPoints = parseFloat(quickGradeMaxPoints)
      if (isNaN(maxPoints) || maxPoints <= 0) {
        throw new Error('Please enter a valid max points value.')
      }


      const enrolledIds = enrolls[currentSubject.code] || []
      const hasAnyScores = enrolledIds.some(studentId => {
        const score = quickGradeScores[studentId]
        return score !== undefined && score !== null && score !== '' && !isNaN(parseFloat(score))
      })

      if (!hasAnyScores) {
        throw new Error('Please enter at least one grade before saving.')
      }


      const assessment = {
        id: Date.now().toString(),
        type: quickGradeType,
        title: quickGradeTitle,
        maxPoints: maxPoints,
        scores: {},
        dueDate: quickGradeDueDate || null,
        dateRecorded: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
      }


      let allScoresValid = true
      enrolledIds.forEach(studentId => {
        const score = parseFloat(quickGradeScores[studentId])
        if (!isNaN(score) && score <= maxPoints && score >= 0) {
          assessment.scores[studentId] = score
        } else if (quickGradeScores[studentId] !== '') {
          allScoresValid = false
        }
      })

      if (!allScoresValid) {
        throw new Error('Some scores are invalid. Please check all scores are between 0 and max points.')
      }


      const updatedGrades = { ...grades }
      if (!updatedGrades[currentSubject.code]) updatedGrades[currentSubject.code] = {}
      if (!updatedGrades[currentSubject.code][quickGradeType]) updatedGrades[currentSubject.code][quickGradeType] = []

      updatedGrades[currentSubject.code][quickGradeType].push(assessment)
      setGrades(updatedGrades)


      let savedCount = 0
      let mysqlSaveSuccessful = false

      for (const studentId of enrolledIds) {
        if (assessment.scores[studentId] !== undefined) {
          try {
            await createGrade({
              studentId: studentId,
              courseCode: currentSubject.code,
              assessmentType: quickGradeType,
              assessmentTitle: quickGradeTitle,
              score: assessment.scores[studentId],
              maxPoints: maxPoints,
              date: new Date().toISOString().split('T')[0]
            })
            savedCount++
          } catch (error) {
            console.error(`Failed to save grade for student ${studentId}:`, error)

          }
        }
      }

      if (savedCount > 0) {
        mysqlSaveSuccessful = true
      }


      if (savedCount > 0) {
        const studentNotification = {
          type: 'grade',
          title: 'New Grades Posted',
          message: `Grade Posted: ${quickGradeTitle} grades for ${currentSubject.name} are now available to ${savedCount} student${savedCount === 1 ? '' : 's'}.`,
          timestamp: new Date(),
          read: false,
          target_courseId: currentSubject.code,
          target_students: enrolledIds.filter(id => assessment.scores[id] !== undefined)
        }



        addCustomAlert(ALERT_TYPES.SUCCESS, 'Grades Saved', `All grades saved successfully for ${quickGradeTitle} (${savedCount} student${savedCount === 1 ? '' : 's'})`, false)


        setQuickGradeType('quiz')
        setQuickGradeTitle('')
        setQuickGradeMaxPoints('')
        setQuickGradeDueDate('')
        setShowQuickGradeGrid(false)
        setQuickGradeScores({})
      }

      setIsSavingGrades(false)
      setGradesSaveStatus('success')


        setTimeout(() => {
          setGradesSaveStatus(null)
        }, TIMEOUTS.NOTIFICATION_AUTO_HIDE)

      return { success: true, savedCount, mysqlSaveSuccessful }

    } catch (error) {
      console.error('Error in handleSaveAllGrades:', error)
      setIsSavingGrades(false)
      setGradesSaveStatus('error')
      addCustomAlert(ALERT_TYPES.ERROR, 'Save Failed', error.message || 'Failed to save grades.', false)


        setTimeout(() => {
          setGradesSaveStatus(null)
        }, TIMEOUTS.NOTIFICATION_AUTO_HIDE)

      return { success: false, error: error.message }
    }
  }, [quickGradeTitle, quickGradeMaxPoints, quickGradeType, quickGradeDueDate, quickGradeScores])

  /**
   * Reset quick grade form
   */
  const resetQuickGrade = useCallback(() => {
    setQuickGradeType('quiz')
    setQuickGradeTitle('')
    setQuickGradeMaxPoints('')
    setQuickGradeDueDate('')
    setShowQuickGradeGrid(false)
    setQuickGradeScores({})
    setShowFillScoreModal(false)
    setFillScoreValue('')
    setIsSavingGrades(false)
    setGradesSaveStatus(null)
  }, [])

  return {

    quickGradeType,
    setQuickGradeType,
    quickGradeTitle,
    setQuickGradeTitle,
    quickGradeMaxPoints,
    setQuickGradeMaxPoints,
    quickGradeDueDate,
    setQuickGradeDueDate,
    showQuickGradeGrid,
    setShowQuickGradeGrid,
    quickGradeScores,
    setQuickGradeScores,
    showFillScoreModal,
    isSavingGrades,
    gradesSaveStatus,
    fillScoreValue,
    setFillScoreValue,


    handleInitQuickGrade,
    handleFillAllGrades,
    handleFillScoreSubmit,
    handleFillScoreCancel,
    handleSaveAllGrades,
    resetQuickGrade,
  }
}
