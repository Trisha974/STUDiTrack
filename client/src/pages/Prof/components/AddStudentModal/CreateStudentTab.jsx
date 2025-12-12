import React from 'react'
import { useTheme } from '../../../../hooks/useTheme'

const CreateStudentTab = ({
  studentSubjectFilter,
  setStudentSubjectFilter,
  subjects,
  newStudent,
  setNewStudent,
  isCreatingStudent,
  handleCreateStudent,
  onClose
}) => {
  const { isDarkMode } = useTheme()

  const handleInputChange = (field, value) => {
    setNewStudent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Step 1 - Enhanced Design */}
      <div className={`rounded-3xl border-2 shadow-xl px-6 py-6 ${
        isDarkMode
          ? 'bg-gradient-to-br from-[#1b1b1b] to-[#151515] border-slate-700'
          : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
      }`}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                isDarkMode
                  ? 'bg-[#7A1315]/30 text-red-400 border border-[#7A1315]/50'
                  : 'bg-[#7A1315]/10 text-[#7A1315] border border-[#7A1315]/20'
              }`}>
                1
              </div>
              <div>
                <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>Step 1</p>
                <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Select Subject to Enroll
                </h4>
              </div>
            </div>
            <p className={`text-sm ml-13 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Choose the class where this student will be enrolled.
            </p>
          </div>
          <div className={`hidden md:flex items-center px-4 py-2 rounded-xl text-xs font-bold shadow-sm ${
            isDarkMode
              ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-slate-200 border border-slate-600'
              : 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border border-slate-200'
          }`}>
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            {subjects.length} available
          </div>
        </div>
        <div className="mt-5">
          <select
            value={studentSubjectFilter || ''}
            onChange={(e) => setStudentSubjectFilter(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
              isDarkMode
                ? 'bg-[#111827] border-slate-600 text-slate-100 focus:border-[#7A1315] focus:ring-2 focus:ring-[#7A1315]/20'
                : 'bg-white border-slate-300 text-slate-800 focus:border-[#7A1315] focus:ring-2 focus:ring-[#7A1315]/20'
            }`}
            required
          >
            <option value="">-- Select a Subject --</option>
            {subjects.map(subject => (
              <option key={subject.code} value={subject.code}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>
          {!studentSubjectFilter && (
            <div className={`mt-3 p-3 rounded-xl flex items-start gap-2 ${
              isDarkMode
                ? 'bg-amber-900/20 border border-amber-800/50'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isDarkMode ? 'text-amber-400' : 'text-amber-600'
              }`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <p className={`text-xs font-medium ${
                isDarkMode ? 'text-amber-300' : 'text-amber-700'
              }`}>
                Please select a subject to enable the create button.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step 2 - Enhanced Design */}
      <div className={`rounded-3xl border-2 shadow-xl px-6 py-6 ${
        isDarkMode
          ? 'bg-gradient-to-br from-[#1b1b1b] to-[#151515] border-slate-700'
          : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
      }`}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                isDarkMode
                  ? 'bg-[#7A1315]/30 text-red-400 border border-[#7A1315]/50'
                  : 'bg-[#7A1315]/10 text-[#7A1315] border border-[#7A1315]/20'
              }`}>
                2
              </div>
              <div>
                <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>Step 2</p>
                <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Student Information
                </h4>
              </div>
            </div>
            <p className={`text-sm ml-13 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Enter the student's details. We'll create their account and enroll them automatically.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          {/* Student ID */}
          <div className="space-y-2">
            <label className={`block text-sm font-bold ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>
              Student ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newStudent.id || ''}
              onChange={(e) => handleInputChange('id', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                isDarkMode
                  ? 'bg-[#111827] border-slate-600 text-slate-100 placeholder-slate-500 focus:border-[#7A1315] focus:ring-2 focus:ring-[#7A1315]/20'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-[#7A1315] focus:ring-2 focus:ring-[#7A1315]/20'
              }`}
              placeholder="e.g., 123456789"
              required
            />
          </div>

          {/* Student Name */}
          <div className="space-y-2">
            <label className={`block text-sm font-bold ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newStudent.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                isDarkMode
                  ? 'bg-[#111827] border-slate-600 text-slate-100 placeholder-slate-500 focus:border-[#7A1315] focus:ring-2 focus:ring-[#7A1315]/20'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-[#7A1315] focus:ring-2 focus:ring-[#7A1315]/20'
              }`}
              placeholder="e.g., John Doe"
              required
            />
          </div>

          {/* Email (optional but recommended) */}
          <div className="space-y-2 md:col-span-2">
            <label className={`block text-sm font-bold ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}>
              Email Address <span className="text-slate-400">(optional)</span>
            </label>
            <input
              type="email"
              value={newStudent.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                isDarkMode
                  ? 'bg-[#111827] border-slate-600 text-slate-100 placeholder-slate-500 focus:border-[#7A1315] focus:ring-2 focus:ring-[#7A1315]/20'
                  : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-[#7A1315] focus:ring-2 focus:ring-[#7A1315]/20'
              }`}
              placeholder="e.g., john.doe@university.edu"
            />
          </div>
        </div>

        {/* Validation Messages */}
        {newStudent.id && newStudent.name && (
          <div className={`mt-4 p-4 rounded-xl border ${
            isDarkMode ? 'bg-emerald-900/20 border-emerald-700 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold">
                  Ready to create student
                </p>
                <p className="text-xs mt-1">
                  Student ID: {newStudent.id} • Name: {newStudent.name}
                  {newStudent.email && ` • Email: ${newStudent.email}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {(!newStudent.id || !newStudent.name) && (
          <div className={`mt-4 p-4 rounded-xl border ${
            isDarkMode ? 'bg-amber-900/20 border-amber-700 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold">
                  Required fields missing
                </p>
                <p className="text-xs mt-1">
                  Please provide both Student ID and Name to create the student account.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 pt-6 border-t-2 ${
        isDarkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        <button
          onClick={onClose}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            isDarkMode
              ? 'text-slate-300 hover:text-white hover:bg-slate-800'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
          }`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={async (e) => {
            e.preventDefault()
            e.stopPropagation()

            await handleCreateStudent()
          }}
          disabled={!newStudent.id || !newStudent.name || !studentSubjectFilter || isCreatingStudent}
          className={`group relative overflow-hidden px-8 py-3 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'bg-gradient-to-r from-[#7A1315] to-[#b91c1c] hover:from-[#8a1518] hover:to-[#c91d1d]'
              : 'bg-gradient-to-r from-[#7A1315] to-[#b91c1c] hover:from-[#8a1518] hover:to-[#c91d1d]'
          }`}
          title={
            !newStudent.id ? 'Please enter a Student ID' :
            !newStudent.name ? 'Please enter a Student Name' :
            !studentSubjectFilter ? 'Please select a subject first' :
            isCreatingStudent ? 'Creating student account...' :
            `Click to create student account and enroll in ${subjects.find(s => s.code === studentSubjectFilter)?.name || 'selected subject'}`
          }
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <span className="relative z-10 flex items-center gap-2">
            {isCreatingStudent ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Student...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" />
                </svg>
                Create & Enroll Student
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  )
}

export default CreateStudentTab

