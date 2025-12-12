import React from 'react'
import { useTheme } from '../../../hooks/useTheme'
import { getProfessorByUid } from '../../../services/professors'
import { setWithBackup } from '../../../services/firestoreWithBackup'
import { setProfessor } from '../../../services/professors'
import { updateSessionUserFields } from '../../../utils/authHelpers'
import { fileToDataUrl, validateImageFile } from '../../../utils/imageHelpers'


const getInitials = (name) => {
  if (!name || name === 'TBA') return 'PU'
  return name.split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const ProfileModal = ({
  isOpen,
  onClose,
  profName,
  profPic,
  profEmail,
  profUid,
  profProfile,
  profileForm,
  setProfileForm,
  profilePreview,
  setProfilePreview,
  profileSaveSuccess,
  setProfileSaveSuccess,
  profileSection,
  setProfileSection,
  realtimeUpdatesDisabled,
  setRealtimeUpdatesDisabled,
  addCustomAlert,
  onProfileUpdate
}) => {
  const { isDarkMode, toggleTheme } = useTheme()

  const handleProfilePicSelection = (file) => {
    if (file) {
      setProfileForm(prev => ({ ...prev, pic: file }))
      const reader = new FileReader()
      reader.onload = (evt) => {
        setProfilePreview(evt.target.result)
      }
      reader.onerror = (error) => {
        console.error('Error reading file:', error)
      }
      reader.readAsDataURL(file)
    } else {
      setProfileForm(prev => ({ ...prev, pic: null }))
      setProfilePreview(profPic)
    }
  }

  const handleRemoveProfilePicture = () => {

    const fileInput = document.getElementById('profile-picture')
    if (fileInput) {
      fileInput.value = ''
    }

    setProfileForm(prev => ({ ...prev, pic: null, removePhoto: true }))

    setProfilePreview(null)
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    

    if (profileSaveSuccess) {
      return
    }
    

    if (!profUid) {
      addCustomAlert('error', 'Authentication Error', 'Unable to determine your account. Please sign in again.', false)
      return
    }


    const updatedName = (profileForm.name?.trim() || profName || '').trim()
    if (!updatedName) {
      addCustomAlert('warning', 'Missing Name', 'Please enter your name.', false)
      return
    }
    if (updatedName.length < 2) {
      addCustomAlert('warning', 'Invalid Name', 'Name must be at least 2 characters long.', false)
      return
    }
    if (updatedName.length > 100) {
      addCustomAlert('warning', 'Invalid Name', 'Name must be less than 100 characters.', false)
      return
    }


    let photoData = profPic
    

    if (profileForm.removePhoto || (profilePreview === null && profPic && !profileForm.pic)) {

      photoData = null
    } else if (profileForm.pic) {
      const file = profileForm.pic
      

      const validation = validateImageFile(file)
      if (!validation.valid) {
        addCustomAlert('error', 'Invalid File', validation.error, false)
        return
      }
      
      try {
        photoData = await fileToDataUrl(file)
      } catch (error) {
        console.error('Failed to process image file', error)
        addCustomAlert('error', 'Image Processing Error', 'Unable to process the selected image. Please try a different file.', false)
        return
      }
    }

    try {

      const updatedProfile = {
        ...(profProfile || {}),
        name: updatedName,
        email: profEmail || profProfile?.email || '',
        department: profProfile?.department || '',

        photoUrl: photoData || null,

        photoURL: photoData || null,
      }


      const savedProfessor = await setProfessor(profUid, updatedProfile)

      if (!savedProfessor) {
        throw new Error('setProfessor returned null or undefined')
      }


      if (onProfileUpdate) {
        onProfileUpdate({
          name: updatedName,
          pic: photoData || null,
          profile: savedProfessor
        })
      }


      updateSessionUserFields({ name: updatedName })


      setProfileSaveSuccess(true)


      setTimeout(() => {
        onClose()
        setProfileSaveSuccess(false)

        setProfileForm({ name: updatedName, pic: null, removePhoto: false })
        setProfilePreview(photoData || null)
      }, 300)
    } catch (error) {
      console.error('Failed to save professor profile', error)
      addCustomAlert('error', 'Save Failed', `Failed to save profile: ${error.message}`, false)
      setProfileSaveSuccess(false)
    }
  }

  const handleRealtimeToggle = async () => {
    const newValue = !realtimeUpdatesDisabled
    try {

      if (newValue) {
        localStorage.setItem('disableRealtimeUpdates', 'true')
      } else {
        localStorage.removeItem('disableRealtimeUpdates')
      }
      setRealtimeUpdatesDisabled(newValue)
      

      if (profUid) {
        try {
          const currentProfile = await getProfessorByUid(profUid)
          const updatedProfile = {
            ...currentProfile,
            preferences: {
              ...(currentProfile?.preferences || {}),
              disableRealtimeUpdates: newValue,
            }
          }

          await setWithBackup('professors', profUid, updatedProfile, { merge: true })
          console.log('✅ Real-time preference saved to Firestore')
        } catch (firestoreError) {

          console.warn('Could not save to Firestore, using localStorage backup:', firestoreError.message)
        }
      }
      
      addCustomAlert('info', 'Real-Time Updates', 
        newValue 
          ? 'Real-time updates disabled. Refresh page to apply. This reduces Firestore quota usage significantly.'
          : 'Real-time updates enabled. Refresh page to apply.',
        false
      )
    } catch (error) {
      console.error('Failed to update real-time settings:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={() => {
        onClose()
        setProfileSaveSuccess(false)
        setProfileSection('account')
      }}
    >
      <div
        className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col lg:flex-row ${
          isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Identity Block - Sidebar (Desktop) / Top (Mobile) */}
        <div className={`lg:w-80 flex-shrink-0 ${
          isDarkMode 
            ? 'bg-[#7A1315]' 
            : 'bg-gradient-to-b from-[#7A1315] to-red-800'
        } flex flex-col`}>
          {/* Profile Picture Container */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center border-b border-red-900/30">
            <div className="relative mb-3 sm:mb-4 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-red-600 to-[#7A1315] flex items-center justify-center overflow-hidden">
                {profilePreview || profPic ? (
                  <img 
                    src={profilePreview || profPic} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-white text-xl sm:text-2xl md:text-3xl font-semibold tracking-wide">
                    {getInitials(profileForm.name || profName)}
                  </span>
                )}
              </div>
              {/* Change Photo Button */}
              <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                <span className="text-white text-xs font-medium">Change Photo</span>
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
            <h3 className={`text-white font-bold text-lg sm:text-xl md:text-2xl text-center mb-1 sm:mb-2 px-2 break-words`}>
              {profileForm.name || profName}
            </h3>
            
            {/* User Role & Identifier */}
            <p className="text-red-100 text-xs sm:text-sm font-medium mb-1 text-center">Professor</p>
            <p className="text-red-200 text-[10px] sm:text-xs text-center px-2 break-words">{profEmail || 'Institutional Email'}</p>
          </div>

          {/* Settings Navigation - Mobile: Horizontal, Desktop: Vertical */}
          <nav className="flex lg:flex-col flex-row overflow-x-auto lg:overflow-y-auto py-2 sm:py-4">
            <button
              onClick={() => setProfileSection('account')}
              className={`w-full lg:w-full px-6 py-4 text-left text-white font-medium transition-all flex items-center space-x-3 ${
                profileSection === 'account' 
                  ? 'bg-red-900/50 border-l-4 border-red-400' 
                  : 'hover:bg-red-900/30'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Account Settings</span>
            </button>
            
            <button
              onClick={() => setProfileSection('appearance')}
              className={`w-full lg:w-full px-6 py-4 text-left text-white font-medium transition-all flex items-center space-x-3 ${
                profileSection === 'appearance' 
                  ? 'bg-red-900/50 border-l-4 border-red-400' 
                  : 'hover:bg-red-900/30'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span>Appearance</span>
            </button>
          </nav>

          {/* Close Button */}
          <div className="p-4 border-t border-red-900/30">
            <button
              onClick={() => {
                onClose()
                setProfileSaveSuccess(false)
                setProfileSection('account')
              }}
              className="w-full px-4 py-2 bg-red-900/50 hover:bg-red-900/70 text-white font-medium rounded-lg transition-all"
            >
              Close Profile
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 overflow-y-auto ${
          isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
        }`}>
          <div className="max-w-4xl mx-auto p-6 lg:p-8">
            {/* Account Settings Section */}
            {profileSection === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className={`text-3xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    Account Settings
                  </h2>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
                    Manage your personal information and security
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
                    Personal Information
                  </h3>
                  <form onSubmit={handleProfileSave} className="space-y-5">
                    <div>
                      <label htmlFor="profile-name" className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-slate-700'
                      }`}>
                        Name
                      </label>
                      <input
                        id="profile-name"
                        name="profile-name"
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#7A1315] ${
                          isDarkMode 
                            ? 'bg-[#1a1a1a] border-[#7A1315] text-white' 
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                        required
                        disabled={profileSaveSuccess}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="profile-email" className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-slate-700'
                      }`}>
                        University Email
                      </label>
                      <input
                        id="profile-email"
                        name="profile-email"
                        type="email"
                        value={profEmail || ''}
                        disabled
                        className={`w-full px-4 py-3 border rounded-lg ${
                          isDarkMode 
                            ? 'bg-[#1a1a1a] border-slate-600 text-slate-400' 
                            : 'bg-slate-50 border-slate-300 text-slate-600'
                        }`}
                      />
                      <small className={`text-xs mt-1 block ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Your institutional email address
                      </small>
                    </div>
                    
                    <div>
                      <label htmlFor="profile-picture" className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-slate-200' : 'text-slate-700'
                      }`}>
                        Profile Picture
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          id="profile-picture"
                          name="profile-picture"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleProfilePicSelection(e.target.files[0])}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#7A1315] file:text-white hover:file:bg-red-800"
                          disabled={profileSaveSuccess}
                        />
                        {(profilePreview || profPic) && (
                          <button
                            type="button"
                            onClick={handleRemoveProfilePicture}
                            disabled={profileSaveSuccess}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                              isDarkMode
                                ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                      <small className={`block text-xs mt-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        Choose a square image for best results
                      </small>
                    </div>
                    
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
                          Profile updated successfully!
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          setProfileSaveSuccess(false)
                          setProfileSection('account')
                        }}
                        className={`px-5 py-2 rounded-xl font-semibold ${
                          isDarkMode 
                            ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-[#7A1315] text-white font-semibold hover:bg-red-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative z-10"
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
                        ? 'bg-[#1a1a1a] border-slate-700' 
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center space-x-4">
                        {isDarkMode ? (
                          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-[#7A1315]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                  {/* Real-Time Updates Toggle */}
                  <div className={`rounded-2xl shadow-lg border p-6 mt-6 ${
                    isDarkMode 
                      ? 'bg-[#1a1a1a] border-slate-700' 
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-1 ${
                          isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>
                          Real-Time Updates
                        </h3>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {realtimeUpdatesDisabled 
                            ? 'Disabled - Reduces Firestore quota usage by 90%+. Data loads once but won\'t update automatically.'
                            : 'Enabled - Dashboard updates automatically when data changes. Uses more Firestore reads.'}
                        </p>
                        {realtimeUpdatesDisabled && (
                          <p className={`text-xs mt-2 ${
                            isDarkMode ? 'text-red-300' : 'text-amber-600'
                          }`}>
                            ⚠️ Refresh the page after toggling for changes to take effect.
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleRealtimeToggle}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1315] focus:ring-offset-2 ${
                          realtimeUpdatesDisabled ? 'bg-slate-400' : 'bg-[#7A1315]'
                        }`}
                        aria-label="Toggle real-time updates"
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            realtimeUpdatesDisabled ? 'translate-x-1' : 'translate-x-9'
                          }`}
                        />
                      </button>
                    </div>
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

