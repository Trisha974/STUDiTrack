import React from 'react'
import { useTheme } from '../../hooks/useTheme'
import { validateSubjectForm } from '../../utils/validationHelpers'

/**
 * Reusable Subject Form Component
 * Can be used for creating or editing subjects
 */
const SubjectForm = ({
  subject = { code: '', name: '', credits: '', term: 'first' },
  onChange,
  onSubmit,
  onCancel,
  error = '',
  isSubmitting = false,
  submitLabel = 'Create Subject',
  cancelLabel = 'Cancel'
}) => {
  const { isDarkMode } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    

    const validation = validateSubjectForm(subject)
    if (!validation.valid) {

      return
    }

    await onSubmit(e)
  }

  const handleChange = (field, value) => {
    onChange({ ...subject, [field]: value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className={`p-3 rounded-lg text-sm ${
          isDarkMode 
            ? 'bg-red-900/30 border border-red-700 text-red-300' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="subject-code" className="sr-only">Subject Code</label>
        <input
          id="subject-code"
          name="subject-code"
          type="text"
          value={subject.code}
          onChange={(e) => handleChange('code', e.target.value)}
          placeholder="Subject Code"
          className="form-input-field focus:ring-2 focus:ring-maroon-500"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="subject-name" className="sr-only">Subject Name</label>
        <input
          id="subject-name"
          name="subject-name"
          type="text"
          value={subject.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Subject Name"
          className="form-input-field focus:ring-2 focus:ring-maroon-500"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label htmlFor="subject-credits" className="sr-only">Credits</label>
        <input
          id="subject-credits"
          name="subject-credits"
          type="text"
          value={subject.credits}
          onChange={(e) => handleChange('credits', e.target.value)}
          placeholder="Credits"
          className="form-input-field focus:ring-2 focus:ring-maroon-500"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDarkMode ? 'text-slate-300' : 'text-slate-700'
        }`}>
          Term
        </label>
        <select
          value={subject.term}
          onChange={(e) => handleChange('term', e.target.value)}
          className="form-input-field focus:ring-2 focus:ring-maroon-500"
          disabled={isSubmitting}
        >
          <option value="first">First Term</option>
          <option value="second">Second Term</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
            isSubmitting
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-maroon-500 hover:bg-maroon-600 active:scale-95'
          } text-white shadow-lg`}
        >
          {isSubmitting ? 'Creating...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              isDarkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  )
}

export default SubjectForm

