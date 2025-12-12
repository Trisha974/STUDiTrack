import React, { useState, useEffect, useRef } from 'react'
import { getDefaultAvatar } from '../../utils/avatarGenerator'


const studentProfileImages = {}

const StudentAvatar = ({ student, className = "w-10 h-10" }) => {
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
    if (studentProfileImages[cacheKey]) {
      setImageUrl(studentProfileImages[cacheKey])
      imageUrlRef.current = studentProfileImages[cacheKey]
      return
    }



    const defaultAvatar = getDefaultAvatar(student.name || student.id || 'Student')
    setImageUrl(defaultAvatar)
    imageUrlRef.current = defaultAvatar
    studentProfileImages[cacheKey] = defaultAvatar
  }, [student])

  if (!student) return null

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true)
      const defaultAvatar = getDefaultAvatar(student.name || student.id || 'Student')
      setImageUrl(defaultAvatar)
      imageUrlRef.current = defaultAvatar
      const cacheKey = `${student.id}-${student.email}`
      studentProfileImages[cacheKey] = defaultAvatar
    }
  }

  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={student.name || student.id}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold text-xs ${className.includes('w-') ? '' : 'text-[0.6rem]'}`}>
          {(student.name || student.id || '?').charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )
}

export default StudentAvatar

