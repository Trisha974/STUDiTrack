import React from 'react'
import { useTheme } from '../../../../hooks/useTheme'

const RestoreStudentTab = ({
  studentSubjectFilter,
  setStudentSubjectFilter,
  subjects,
  archivedStudents,
  selectedArchivedStudents,
  setSelectedArchivedStudents,
  isRestoringStudents,
  handleRestoreStudents,
  onClose
}) => {
  const { isDarkMode } = useTheme()

  const handleSelectAll = () => {
    if (selectedArchivedStudents.length === archivedStudents.length) {
      setSelectedArchivedStudents([])
    } else {
      setSelectedArchivedStudents(archivedStudents.map(s => s.id))
    }
  }

  const handleSelectStudent = (studentId) => {
    setSelectedArchivedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const selectedStudents = archivedStudents.filter(s => selectedArchivedStudents.includes(s.id))

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
              Choose the class where archived students will be re-enrolled.
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
                Please select a subject to view archived students.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Step 2 - Enhanced Design */}
      {studentSubjectFilter && (
        <div className={`rounded-3xl border-2 shadow-xl overflow-hidden ${
          isDarkMode
            ? 'bg-gradient-to-br from-[#1b1b1b] to-[#151515] border-slate-700'
            : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${
            isDarkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex items-center gap-3">
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
                <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Select Archived Students ({archivedStudents.length} available)
                  {selectedArchivedStudents.length > 0 && (
                    <span className={`ml-2 text-sm font-normal ${
                      isDarkMode ? 'text-[#7A1315]' : 'text-[#7A1315]'
                    }`}>
                      ({selectedArchivedStudents.length} selected)
                    </span>
                  )}
                </h4>
              </div>
            </div>
            {archivedStudents.length > 0 && (
              <button
                onClick={handleSelectAll}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  isDarkMode
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {selectedArchivedStudents.length === archivedStudents.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>

          {archivedStudents.length === 0 ? (
            <div className="p-8 text-center">
              <svg className={`w-16 h-16 mx-auto mb-4 ${
                isDarkMode ? 'text-slate-600' : 'text-slate-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className={`text-lg font-semibold mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>No Archived Students</p>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                There are no archived students for this subject.
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {archivedStudents.map((student) => {
                  const isSelected = selectedArchivedStudents.includes(student.id)

                  return (
                    <div
                      key={student.id}
                      className={`p-4 hover:bg-opacity-50 transition-colors cursor-pointer ${
                        isSelected
                          ? isDarkMode
                            ? 'bg-[#7A1315]/20 border-l-4 border-[#7A1315]'
                            : 'bg-[#7A1315]/5 border-l-4 border-[#7A1315]'
                          : isDarkMode
                            ? 'hover:bg-slate-800/30'
                            : 'hover:bg-slate-50/50'
                      }`}
                      onClick={() => handleSelectStudent(student.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#7A1315] border-[#7A1315]'
                              : isDarkMode
                                ? 'border-slate-500 hover:border-slate-400'
                                : 'border-slate-300 hover:border-slate-400'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className={`font-semibold ${
                              isDarkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                              {student.name}
                            </p>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              ID: {student.id}
                              {student.email && ` • ${student.email}`}
                            </p>
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                          isDarkMode
                            ? 'bg-slate-700 text-slate-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          Archived
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

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

            await handleRestoreStudents()
          }}
          disabled={!studentSubjectFilter || selectedArchivedStudents.length === 0 || isRestoringStudents}
          className={`group relative overflow-hidden px-8 py-3 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDarkMode
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
          }`}
          title={
            !studentSubjectFilter ? 'Please select a subject first' :
            selectedArchivedStudents.length === 0 ? 'Please select at least one student to restore' :
            isRestoringStudents ? 'Restoring students...' :
            `Click to restore ${selectedArchivedStudents.length} student${selectedArchivedStudents.length !== 1 ? 's' : ''} to ${subjects.find(s => s.code === studentSubjectFilter)?.name || 'selected subject'}`
          }
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <span className="relative z-10 flex items-center gap-2">
            {isRestoringStudents ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Restoring...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restore Student{selectedArchivedStudents.length > 1 ? 's' : ''}{selectedArchivedStudents.length > 0 ? ` (${selectedArchivedStudents.length})` : ''}
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  )
}

export default RestoreStudentTab

