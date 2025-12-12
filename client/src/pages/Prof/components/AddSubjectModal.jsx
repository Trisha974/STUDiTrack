import React from 'react'
import { useTheme } from '../../../hooks/useTheme'
import { validateSubjectForm } from '../../../utils/validationHelpers'
import SubjectForm from '../../../components/forms/SubjectForm'

const AddSubjectModal = ({
  isOpen,
  onClose,
  newSubject,
  setNewSubject,
  addSubjectError,
  setAddSubjectError,
  isSavingSubject,
  setIsSavingSubject,
  onSubmit
}) => {
  const { isDarkMode } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    

    setAddSubjectError('')
    

    const validation = validateSubjectForm(newSubject)
    if (!validation.valid) {
      setAddSubjectError(validation.errors.join('. '))
      return
    }



    await onSubmit(e)
  }

  const handleCancel = () => {
    setAddSubjectError('')
    setIsSavingSubject(false)
    setNewSubject({ code: '', name: '', credits: '', term: 'first' })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 modal items-center justify-center z-50 p-3 sm:p-4 flex" 
      onClick={handleCancel}
    >
      <div 
        className={`glass rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-md shadow-2xl ${isDarkMode ? 'bg-[#1a1a1a]' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 primary rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
          </div>
          <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Add New Subject
          </h3>
          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Create a new academic subject
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="subject-code" className="sr-only">Subject Code</label>
            <input
              id="subject-code"
              name="subject-code"
              type="text"
              value={newSubject.code}
              onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Subject Code"
              className="form-input-field focus:ring-2 focus:ring-maroon-500"
              required
              disabled={isSavingSubject}
            />
          </div>
          
          <div>
            <label htmlFor="subject-name" className="sr-only">Subject Name</label>
            <input
              id="subject-name"
              name="subject-name"
              type="text"
              value={newSubject.name}
              onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Subject Name"
              className="form-input-field focus:ring-2 focus:ring-maroon-500"
              required
              disabled={isSavingSubject}
            />
          </div>
          
          <div>
            <label htmlFor="subject-credits" className="sr-only">Credits</label>
            <input
              id="subject-credits"
              name="subject-credits"
              type="text"
              value={newSubject.credits}
              onChange={(e) => setNewSubject(prev => ({ ...prev, credits: e.target.value }))}
              placeholder="Credits"
              className="form-input-field focus:ring-2 focus:ring-maroon-500"
              required
              disabled={isSavingSubject}
            />
          </div>
          
          {/* Term Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Term
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setNewSubject(prev => ({ ...prev, term: 'first' }))}
                disabled={isSavingSubject}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  newSubject.term === 'first'
                    ? isDarkMode
                      ? 'bg-[#7A1315] text-white shadow-lg'
                      : 'bg-[#7A1315] text-white shadow-lg'
                    : isDarkMode
                      ? 'bg-[#2c2c2c] text-slate-300 border border-slate-600 hover:bg-[#3c3c3c] hover:border-slate-500'
                      : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                } ${isSavingSubject ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                1st Term
              </button>
              <button
                type="button"
                onClick={() => setNewSubject(prev => ({ ...prev, term: 'second' }))}
                disabled={isSavingSubject}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  newSubject.term === 'second'
                    ? isDarkMode
                      ? 'bg-[#7A1315] text-white shadow-lg'
                      : 'bg-[#7A1315] text-white shadow-lg'
                    : isDarkMode
                      ? 'bg-[#2c2c2c] text-slate-300 border border-slate-600 hover:bg-[#3c3c3c] hover:border-slate-500'
                      : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                } ${isSavingSubject ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                2nd Term
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {addSubjectError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium text-sm flex-1">{addSubjectError}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSavingSubject}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn text-white px-6 py-3 rounded-xl font-semibold shadowLg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSavingSubject}
            >
              {isSavingSubject ? 'Saving...' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddSubjectModal

