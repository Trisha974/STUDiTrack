import React from 'react'
import { useTheme } from '../../hooks/useTheme'
import { validateStudentForm } from '../../utils/validationHelpers'

/**
 * Reusable Student Form Component
 * Can be used for creating or editing students
 */
const StudentForm = ({
  student = { id: '', name: '', email: '', subjects: [] },
  onChange,
  onSubmit,
  onCancel,
  error = '',
  isSubmitting = false,
  submitLabel = 'Create Student',
  cancelLabel = 'Cancel',
  availableSubjects = [],
  onSubjectToggle = null
}) => {
  const { isDarkMode } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    

    const validation = validateStudentForm(student)
    if (!validation.valid) {

      return
    }

    await onSubmit(e)
  }

  const handleChange = (field, value) => {
    onChange({ ...student, [field]: value })
  }

  const handleSubjectToggle = (subjectCode) => {
    if (onSubjectToggle) {
      onSubjectToggle(subjectCode)
    } else {

      const current = student.subjects || []
      const updated = current.includes(subjectCode)
        ? current.filter(code => code !== subjectCode)
        : [...current, subjectCode]
      handleChange('subjects', updated)
    }
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
        <label htmlFor="student-id" className="sr-only">Student ID</label>
        <input
          id="student-id"
          name="student-id"
          type="text"
          value={student.id}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '')
            handleChange('id', value)
          }}
          placeholder="Student ID"
          className={`form-input-field focus:ring-2 focus:ring-maroon-500 ${
            isDarkMode ? 'bg-[#101010] border-slate-700 text-white placeholder:text-slate-500' : ''
          }`}
          pattern="[0-9]*"
          inputMode="numeric"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="student-name" className="sr-only">Full Name</label>
        <input
          id="student-name"
          name="student-name"
          type="text"
          value={student.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Full Name"
          className={`form-input-field focus:ring-2 focus:ring-maroon-500 ${
            isDarkMode ? 'bg-[#101010] border-slate-700 text-white placeholder:text-slate-500' : ''
          }`}
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="student-email" className="sr-only">Email</label>
        <input
          id="student-email"
          name="student-email"
          type="email"
          value={student.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Email Address"
          className={`form-input-field focus:ring-2 focus:ring-maroon-500 ${
            isDarkMode ? 'bg-[#101010] border-slate-700 text-white placeholder:text-slate-500' : ''
          }`}
          required
          disabled={isSubmitting}
        />
      </div>

      {availableSubjects.length > 0 && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Enroll in Subjects (Optional)
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableSubjects.map((subject) => (
              <label
                key={subject.code}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                  (student.subjects || []).includes(subject.code)
                    ? isDarkMode
                      ? 'bg-maroon-500/20 border border-maroon-500/50'
                      : 'bg-maroon-50 border border-maroon-200'
                    : isDarkMode
                      ? 'bg-slate-800 border border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={(student.subjects || []).includes(subject.code)}
                  onChange={() => handleSubjectToggle(subject.code)}
                  disabled={isSubmitting}
                  className="mr-3"
                />
                <span className={`text-sm ${
                  isDarkMode ? 'text-slate-200' : 'text-slate-700'
                }`}>
                  {subject.code} - {subject.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

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

export default StudentForm

