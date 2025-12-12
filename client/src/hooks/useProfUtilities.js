import { useState, useCallback, useRef, useEffect } from 'react'
import { getStudentByNumericalId, getStudentByEmail } from '../services/students'

/**
 * Hook for Prof.jsx utility functions
 * Extracts utility functions to reduce Prof.jsx size
 */
export function useProfUtilities() {
  const [studentProfileImages, setStudentProfileImages] = useState({})


  const getStudentProfileImage = useCallback(async (studentId, studentEmail) => {

    const cacheKey = `${studentId}-${studentEmail}`
    if (studentProfileImages[cacheKey]) {
      return studentProfileImages[cacheKey]
    }


    try {
      let studentProfile = null
      if (studentId && /^\d+$/.test(String(studentId))) {
        studentProfile = await getStudentByNumericalId(studentId)
      }
      if (!studentProfile && studentEmail) {
        studentProfile = await getStudentByEmail(studentEmail)
      }

      if (studentProfile && (studentProfile.photoURL || studentProfile.photo_url)) {
        const photoUrl = studentProfile.photoURL || studentProfile.photo_url

        setStudentProfileImages(prev => ({
          ...prev,
          [cacheKey]: photoUrl
        }))
        return photoUrl
      }
    } catch (error) {
      console.warn(`Failed to fetch profile image for student ${studentId}:`, error)
    }

    return null
  }, [studentProfileImages])

  return {
    getStudentProfileImage,
    studentProfileImages
  }
}

/**
 * StudentAvatar component extracted from Prof.jsx
 * Displays student avatar with profile image or initials
 */
export function StudentAvatar({ student, className = "w-10 h-10", studentProfileImages, getStudentProfileImage }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [imageError, setImageError] = useState(false)
  const loadingRef = useRef(false)
  const studentKeyRef = useRef(null)
  const imageUrlRef = useRef(null)

  useEffect(() => {

    const currentKey = student ? `${student.id}-${student.email}` : null
    if (!student || currentKey === studentKeyRef.current) {
      return
    }


    studentKeyRef.current = currentKey
    loadingRef.current = false
    setImageError(false)
    setImageUrl(null)
    imageUrlRef.current = null


    const cacheKey = `${student.id}-${student.email}`
    if (studentProfileImages && studentProfileImages[cacheKey]) {
      setImageUrl(studentProfileImages[cacheKey])
      imageUrlRef.current = studentProfileImages[cacheKey]
      return
    }


    if (loadingRef.current) return
    loadingRef.current = true

    const loadImage = async () => {
      try {
        const photoUrl = await getStudentProfileImage(student.id, student.email)
        if (photoUrl) {
          setImageUrl(photoUrl)
          imageUrlRef.current = photoUrl
        } else {
          setImageError(true)
        }
      } catch (error) {
        console.warn(`Failed to fetch profile image for student ${student.id}:`, error)
        setImageError(true)
      } finally {
        loadingRef.current = false
      }
    }

    loadImage()
  }, [student?.id, student?.email, studentProfileImages, getStudentProfileImage])

  const initials = student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'

  if (!imageUrl || imageError) {
    return (
      <div className={`${className} bg-gradient-to-r from-red-800 to-red-600 rounded-full flex items-center justify-center flex-shrink-0`}>
        <span className="text-white font-semibold text-sm">
          {initials}
        </span>
      </div>
    )
  }

  return (
    <div className={`${className} rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white shadow-md`}>
      <img 
        src={imageUrl} 
        alt={student?.name || 'Student'} 
        className="w-full h-full object-cover"
        onError={() => {
          setImageError(true)
        }}
      />
    </div>
  )
}

