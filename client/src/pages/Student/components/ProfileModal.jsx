import React, { useRef, useEffect } from 'react'
import { useTheme } from '../../../hooks/useTheme'
import { setStudent } from '../../../services/students'
import { updateSessionUserFields } from '../../../utils/authHelpers'
import { fileToDataUrl, validateImageFile } from '../../../utils/imageHelpers'


const getInitials = (name) => {
  if (!name || name === 'Student') return 'SU'
  return name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const ProfileModal = ({
  isOpen,
  onClose,
  studentName,
  studentPic,
  studentEmail,
  studentUid,
  studentProfile,
  profileForm,
  setProfileForm,
  profilePreview,
  setProfilePreview,
  profileSaveSuccess,
  setProfileSaveSuccess,
  profileSaveError,
  setProfileSaveError,
  profileSection,
  setProfileSection,
  originalStudentPicRef,
  onProfileUpdate
}) => {
  const { isDarkMode, toggleTheme } = useTheme()


  useEffect(() => {
    if (isOpen) {
      const currentPhoto = studentProfile?.photo_url || studentProfile?.photoURL || studentPic
      originalStudentPicRef.current = currentPhoto
    }
  }, [isOpen, studentProfile, studentPic, originalStudentPicRef])

  const handleProfilePicSelection = (file) => {
    if (file) {
      setProfileForm(prev => ({ ...prev, pic: file, removePhoto: false }))
      const reader = new FileReader()
      reader.onload = (evt) => {
        setProfilePreview(evt.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      setProfileForm(prev => ({ ...prev, pic: null, removePhoto: false }))
      setProfilePreview(studentPic)
    }
  }

  const handleRemoveProfilePicture = () => {
    console.log('Removing profile picture')

    const fileInput = document.getElementById('student-profile-picture')
    if (fileInput) {
      fileInput.value = ''
    }

    setProfileForm(prev => ({ ...prev, pic: null, removePhoto: true }))

    setProfilePreview(null)
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    

    setProfileSaveError('')
    

    if (!studentUid) {
      setProfileSaveError('Unable to determine your account. Please sign in again.')
      return
    }


    const updatedName = profileForm.name?.trim() || ''
    if (!updatedName) {
      setProfileSaveError('Please enter your name.')
      return
    }
    if (updatedName.length < 2) {
      setProfileSaveError('Name must be at least 2 characters long.')
      return
    }
    if (updatedName.length > 100) {
      setProfileSaveError('Name must be less than 100 characters.')
      return
    }


    let photoData = studentPic
    if (profileForm.removePhoto || (profilePreview === null && studentPic && !profileForm.pic)) {

      photoData = null
    } else if (profileForm.pic) {
      const file = profileForm.pic
      

      const validation = validateImageFile(file, { maxSize: 10 * 1024 * 1024 })
      if (!validation.valid) {
        setProfileSaveError(validation.error)
        return
      }
      
      try {
        photoData = await fileToDataUrl(file)
      } catch (error) {
        console.error('Failed to process image file', error)
        setProfileSaveError('Unable to process the selected image. Please try a different file.')
        return
      }
    }

    try {

      const updatedProfile = {
        ...(studentProfile || {}),
        name: updatedName,
        email: studentEmail || studentProfile?.email || '',
        studentId: studentProfile?.studentId || studentProfile?.student_id || '',
        department: studentProfile?.department || '',
        photoURL: photoData || null,
      }


      const savedProfile = await setStudent(studentUid, updatedProfile)
      
      if (!savedProfile) {
        throw new Error('Failed to save profile to database')
      }


      updateSessionUserFields({
        name: savedProfile.name || updatedName,
        photoURL: savedProfile.photoURL || savedProfile.photo_url || photoData
      })


      if (onProfileUpdate) {
        onProfileUpdate({
          name: savedProfile.name || updatedName,
          photoURL: savedProfile.photoURL || savedProfile.photo_url || photoData,
          email: savedProfile.email || studentEmail || studentProfile?.email || '',
          profile: savedProfile
        })
      }


      setProfileSaveSuccess(true)


      setTimeout(() => {
        handleClose()
        setProfileSaveSuccess(false)

        setProfileForm({ name: savedProfile.name || studentName, pic: null, removePhoto: false })
        setProfilePreview(savedProfile.photoURL || savedProfile.photo_url || photoData || null)
        originalStudentPicRef.current = savedProfile.photoURL || savedProfile.photo_url || photoData || null
      }, 1500)
    } catch (error) {
      console.error('Failed to save profile:', error)
      setProfileSaveError(error.message || 'Failed to save profile. Please try again.')
    }
  }

  const handleClose = () => {

    if (originalStudentPicRef.current !== null) {
      setProfilePreview(originalStudentPicRef.current)
      setProfileForm(prev => ({ ...prev, pic: null, removePhoto: false }))
    }
    setProfileSaveSuccess(false)
    setProfileSection('account')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl flex flex-col lg:flex-row ${
          isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Identity Block - Sidebar (Desktop) / Top (Mobile) */}
        <div className={`lg:w-80 w-full lg:max-w-none flex-shrink-0 ${
          isDarkMode 
            ? 'bg-[#7A1315]' 
            : 'bg-gradient-to-b from-[#7A1315] to-red-800'
        } flex flex-col`}>
          {/* Profile Picture Container */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center border-b border-red-900/30">
            <div className="relative mb-3 sm:mb-4 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-2 sm:border-4 border-white shadow-xl bg-gradient-to-br from-red-600 to-[#7A1315] flex items-center justify-center overflow-hidden">
                {profilePreview || studentPic ? (
                  <img 
                    src={profilePreview || studentPic} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {

                      const imgElement = e.target
                      const parent = imgElement.parentElement
                      if (parent) {
                        imgElement.style.display = 'none'
                        const initialsSpan = document.createElement('span')
                        initialsSpan.className = 'text-white text-3xl font-semibold tracking-wide'
                        initialsSpan.textContent = getInitials(profileForm.name || studentName)
                        parent.appendChild(initialsSpan)
                      }
                    }}
                  />
                ) : (
                  <span className="text-white text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide">
                    {getInitials(profileForm.name || studentName)}
                  </span>
                )}
              </div>
              {/* Change Photo Button */}
              <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                <span className="text-white text-[10px] sm:text-xs font-medium">Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleProfilePicSelection(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={profileSaveSuccess}
                />
              </label>
            </div>
              
            {/* User Name - Bold */}
            <h3 className="text-white font-bold text-lg sm:text-xl md:text-2xl text-center mb-1 sm:mb-2 truncate w-full px-2">
              {profileForm.name || studentName}
            </h3>
            
            {/* User Role & Identifier */}
            <p className="text-red-100 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 text-center">Student</p>
            <p className="text-red-200 text-[10px] sm:text-xs mb-0.5 sm:mb-1 text-center w-full px-2 break-words">{studentProfile?.studentId || studentProfile?.student_id || 'Student ID'}</p>
            <p className="text-red-200 text-[10px] sm:text-xs text-center w-full px-2 break-words">{studentEmail || studentProfile?.email || 'Email'}</p>
          </div>

          {/* Settings Navigation - Mobile: Horizontal, Desktop: Vertical */}
          <nav className="flex lg:flex-col flex-row lg:flex-1 py-2 sm:py-4 overflow-x-auto lg:overflow-y-auto">
            <button
              onClick={() => setProfileSection('account')}
              className={`w-full lg:w-full px-4 sm:px-6 py-2 sm:py-3 lg:py-4 text-left text-white font-medium transition-all flex items-center space-x-2 sm:space-x-3 whitespace-nowrap ${
                profileSection === 'account' 
                  ? 'bg-red-900/50 lg:border-l-4 border-b-2 lg:border-b-0 border-yellow-400' 
                  : 'hover:bg-red-900/30'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs sm:text-sm">Account Settings</span>
            </button>
            
            <button
              onClick={() => setProfileSection('appearance')}
              className={`w-full lg:w-full px-4 sm:px-6 py-2 sm:py-3 lg:py-4 text-left text-white font-medium transition-all flex items-center space-x-2 sm:space-x-3 whitespace-nowrap ${
                profileSection === 'appearance' 
                  ? 'bg-red-900/50 lg:border-l-4 border-b-2 lg:border-b-0 border-yellow-400' 
                  : 'hover:bg-red-900/30'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="text-xs sm:text-sm">Appearance</span>
            </button>
          </nav>

          {/* Close Button */}
          <div className="p-2 sm:p-4 border-t border-red-900/30">
            <button
              onClick={handleClose}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-red-900/50 hover:bg-red-900/70 text-white text-xs sm:text-sm font-medium rounded-lg transition-all"
            >
              Close Profile
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto ${
          isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
        }`}>
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Account Settings Section */}
            {profileSection === 'account' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    Account Settings
                  </h2>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Manage your personal information
                  </p>
                </div>

                <div className={`rounded-xl sm:rounded-2xl shadow-lg border p-4 sm:p-6 ${
                  isDarkMode 
                    ? 'bg-[#1a1a1a] border-slate-700' 
                    : 'bg-white border-slate-200'
                }`}>
                  <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    Personal Information
                  </h3>
                  <form onSubmit={handleProfileSave} className="space-y-4 sm:space-y-5">
                    <div>
                      <label className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${
                        isDarkMode ? 'text-white' : 'text-slate-700'
                      }`}>
                        Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-[#7A1315] ${
                          isDarkMode 
                            ? 'bg-[#2c2c2c] border-[#7A1315] text-white' 
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                        required
                        disabled={profileSaveSuccess}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${
                        isDarkMode ? 'text-white' : 'text-slate-700'
                      }`}>
                        Student ID
                      </label>
                      <input
                        type="text"
                        value={studentProfile?.studentId || studentProfile?.student_id || ''}
                        disabled
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base ${
                          isDarkMode 
                            ? 'bg-[#1a1a1a] border-slate-600 text-slate-400' 
                            : 'bg-slate-50 border-slate-300 text-slate-600'
                        }`}
                      />
                      <small className={`text-[10px] sm:text-xs mt-1 block ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Your student identification number
                      </small>
                    </div>
                    
                    <div>
                      <label className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${
                        isDarkMode ? 'text-slate-200' : 'text-slate-700'
                      }`}>
                        Profile Picture
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <input
                          id="student-profile-picture"
                          name="student-profile-picture"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleProfilePicSelection(e.target.files[0])}
                          className="file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-[#7A1315] file:text-white hover:file:bg-red-800 text-xs sm:text-sm"
                          disabled={profileSaveSuccess}
                        />
                        {(originalStudentPicRef.current || profilePreview || studentPic) && (
                          <button
                            type="button"
                            onClick={handleRemoveProfilePicture}
                            disabled={profileSaveSuccess}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                              isDarkMode
                                ? 'bg-red-900/50 text-red-200 hover:bg-red-900/70 border border-red-700'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {profilePreview || studentPic ? 'Remove Photo' : 'Photo Removed'}
                          </button>
                        )}
                      </div>
                      <small className={`block text-[10px] sm:text-xs mt-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Choose a square image for best results
                      </small>
                    </div>
            
                    {/* Error Message */}
                    {profileSaveError && (
                      <div className={`rounded-xl p-4 flex items-center space-x-3 border ${
                        isDarkMode 
                          ? 'bg-red-900/30 border-red-700' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <svg className={`w-5 h-5 flex-shrink-0 ${
                          isDarkMode ? 'text-red-400' : 'text-red-600'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className={`font-medium ${
                          isDarkMode ? 'text-red-300' : 'text-red-800'
                        }`}>
                          {profileSaveError}
                        </p>
                      </div>
                    )}
          
                    {/* Success Message */}
                    {profileSaveSuccess && (
                      <div className={`rounded-xl p-4 flex items-center space-x-3 border ${
                        isDarkMode 
                          ? 'bg-emerald-900/30 border-emerald-700' 
                          : 'bg-emerald-50 border-emerald-200'
                      }`}>
                        <svg className={`w-5 h-5 flex-shrink-0 ${
                          isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className={`font-medium ${
                          isDarkMode ? 'text-emerald-300' : 'text-emerald-800'
                        }`}>
                          Profile updated successfully! Your changes have been saved.
                        </p>
                      </div>
                    )}
          
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-3 pt-3 sm:pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          handleClose()

                          if (studentProfile?.photo_url || studentProfile?.photoURL) {
                            setProfilePreview(studentProfile.photo_url || studentProfile.photoURL)
                          } else {
                            setProfilePreview(null)
                          }
                          setProfileForm({ name: studentProfile?.name || studentName, pic: null })
                        }}
                        className={`px-4 sm:px-5 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold w-full sm:w-auto ${
                          isDarkMode 
                            ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {profileSaveSuccess ? 'Close' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-5 sm:px-6 py-2 rounded-lg sm:rounded-xl bg-[#7A1315] text-white text-sm sm:text-base font-semibold hover:bg-red-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        disabled={profileSaveSuccess}
                      >
                        {profileSaveSuccess ? 'Saved!' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Appearance Section - Dark/Light Mode Toggle */}
            {profileSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className={`text-3xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    Appearance
                  </h2>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    Customize your interface theme and display preferences
                  </p>
                </div>

                <div className={`rounded-2xl shadow-lg border p-6 ${
                  isDarkMode 
                    ? 'bg-[#1a1a1a] border-slate-700' 
                    : 'bg-white border-slate-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    Interface Theme
                  </h3>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-4 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-[#2c2c2c] border-slate-700' 
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center space-x-4">
                        {isDarkMode ? (
                          <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                        <div>
                          <p className={`font-semibold ${
                            isDarkMode ? 'text-white' : 'text-slate-800'
                          }`}>
                            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                          </p>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-600'
                          }`}>
                            {isDarkMode 
                              ? 'Dark theme for reduced eye strain' 
                              : 'Light theme for better visibility'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1315] focus:ring-offset-2 ${
                          isDarkMode ? 'bg-[#7A1315]' : 'bg-slate-300'
                        }`}
                        aria-label="Toggle dark mode"
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            isDarkMode ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      The theme applies system-wide to all screens, maintaining consistent readability and navigation across the application.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal

