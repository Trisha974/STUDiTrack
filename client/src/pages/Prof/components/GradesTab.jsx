import React from 'react'
import { useTheme } from '../../../hooks/useTheme'
import { normalizeStudentId } from '../../../utils/validationHelpers'
import { findStudentById } from '../../../utils/studentHelpers'
import { useQuickGrade } from '../../../hooks/useQuickGrade'

const GradesTab = ({
  currentSubject,
  enrolls,
  students,
  grades,
  setGrades,
  onBackToSubjects,
  onExportCSV,
  addCustomAlert,
  profUid
}) => {

  const {
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
    setShowFillScoreModal,
    fillScoreValue,
    setFillScoreValue,
    isSavingGrades,
    gradesSaveStatus,
    handleInitQuickGrade,
    handleFillAllGrades,
    handleFillScoreSubmit,
    handleFillScoreCancel,
    handleSaveAllGrades,
    resetQuickGrade
  } = useQuickGrade()


  const onInitQuickGrade = () => handleInitQuickGrade(enrolls, currentSubject)
  const onFillScoreSubmit = () => handleFillScoreSubmit(enrolls, currentSubject)
  const onSaveAllGrades = () => handleSaveAllGrades(currentSubject, enrolls, grades, setGrades, addCustomAlert, profUid)
  const { isDarkMode } = useTheme()

  if (!currentSubject) {
    return (
      <div className="glass rounded-2xl shadow-xl p-8">
        <div className="text-center py-12">
          <p className="text-slate-600 text-lg mb-4">No subject selected</p>
          <p className="text-slate-500">Click on a subject and then click "Manage Grades" to enter grades</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToSubjects}
            className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-all"
          >
            <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <h2 className="text-3xl font-bold textGrad">{currentSubject.name}</h2>
            <p className="text-slate-600 mt-1">{currentSubject.code} • {currentSubject.credits} Credits</p>
          </div>
        </div>
        <div className="ml-auto relative">
          <button
            onClick={onExportCSV}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 20h14v-2H5v2zM12 2v12l4-4h-3V2h-2v8H8l4 4z" />
            </svg>
            <span>Export CSV (Excel)</span>
          </button>
        </div>
      </div>

      {/* Quick Grade Entry Section */}
      <div className="mb-8">
        <div className={`rounded-2xl p-6 mb-6 ${
          isDarkMode 
            ? 'bg-[#1a1a1a]' 
            : 'bg-white'
        } shadow-md`}>
          <h3 className={`text-lg font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-maroon-800'
          }`}>Quick Grade Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="quick-grade-type" className="sr-only">Grade Type</label>
              <select
                id="quick-grade-type"
                name="quick-grade-type"
                value={quickGradeType}
                onChange={(e) => setQuickGradeType(e.target.value)}
                className={`form-select-field-red focus:ring-2 focus:ring-maroon-500 ${
                  isDarkMode 
                    ? 'bg-[#1a1a1a] border-slate-600 text-white' 
                    : ''
                }`}
              >
                <option value="quiz">📝 Quiz</option>
                <option value="exam">📋 Exam</option>
                <option value="laboratory">🔬 Laboratory</option>
                <option value="assignment">📚 Assignment</option>
                <option value="research">🔍 Research</option>
                <option value="project">💼 Project</option>
              </select>
            </div>
            <div>
              <label htmlFor="quick-grade-title" className="sr-only">Grade Title</label>
              <input
                id="quick-grade-title"
                name="quick-grade-title"
                type="text"
                value={quickGradeTitle}
                onChange={(e) => setQuickGradeTitle(e.target.value)}
                placeholder="QUIZ1"
                className={`form-input-field-red focus:ring-2 focus:ring-maroon-500 ${
                  isDarkMode 
                    ? 'bg-[#1a1a1a] border-slate-600 text-white placeholder:text-slate-400' 
                    : ''
                }`}
              />
            </div>
            <div>
              <label htmlFor="quick-grade-max-points" className="sr-only">Max Points</label>
              <input
                id="quick-grade-max-points"
                name="quick-grade-max-points"
                type="number"
                value={quickGradeMaxPoints}
                onChange={(e) => setQuickGradeMaxPoints(e.target.value)}
                placeholder="20"
                min="1"
                max="1000"
                className={`form-input-field-red focus:ring-2 focus:ring-maroon-500 ${
                  isDarkMode 
                    ? 'bg-[#1a1a1a] border-slate-600 text-white placeholder:text-slate-400' 
                    : ''
                }`}
              />
            </div>
            <button
              onClick={onInitQuickGrade}
              className="btn text-white px-6 py-3 rounded-xl font-semibold shadowLg transition-all"
            >
              Start Entry
            </button>
          </div>
        </div>
        
        {/* Quick Grade Input Grid */}
        {showQuickGradeGrid && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>Enter Grades</h4>
              <div className="flex space-x-3">
                <button
                  onClick={onFillAllGrades}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDarkMode
                      ? 'bg-red-900/50 hover:bg-red-900/70 text-red-200'
                      : 'bg-red-100 hover:bg-red-200 text-red-700'
                  }`}
                >
                  Fill All Same Score
                </button>
                <button
                  onClick={onSaveAllGrades}
                  disabled={isSavingGrades}
                  className={`px-6 py-3 rounded-xl font-semibold shadowLg transition-all ${
                    gradesSaveStatus === 'success'
                      ? 'bg-green-500 text-white'
                      : gradesSaveStatus === 'error'
                      ? 'bg-red-500 text-white'
                      : isSavingGrades
                      ? 'bg-emerald-400 text-white cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {gradesSaveStatus === 'success' ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Grades Saved!
                    </span>
                  ) : gradesSaveStatus === 'error' ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Save Failed
                    </span>
                  ) : isSavingGrades ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save All Grades'
                  )}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className={`min-w-full border rounded-xl overflow-hidden ${
                isDarkMode ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <thead className={isDarkMode ? 'bg-[#7A1315]' : 'bg-slate-50'}>
                  <tr>
                    <th className={`px-3 py-2 text-left text-xs font-semibold border-b ${
                      isDarkMode 
                        ? 'text-white border-slate-600' 
                        : 'text-slate-600 border-slate-200'
                    }`}>Student ID</th>
                    <th className={`px-3 py-2 text-left text-xs font-semibold border-b ${
                      isDarkMode 
                        ? 'text-white border-slate-600' 
                        : 'text-slate-600 border-slate-200'
                    }`}>Student Name</th>
                    <th className={`px-3 py-2 text-left text-xs font-semibold border-b ${
                      isDarkMode 
                        ? 'text-white border-slate-600' 
                        : 'text-slate-600 border-slate-200'
                    }`}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSubject && enrolls[currentSubject.code] && enrolls[currentSubject.code].map((studentId, index) => {
                    const student = findStudentById(students, studentId)
                    if (!student) return null
                    return (
                      <tr key={studentId} className={isDarkMode && index % 2 === 0 ? 'bg-[#1a1a1a]' : isDarkMode ? 'bg-[#1a1a1a]' : ''}>
                        <td className={`px-3 py-2 text-sm border-b ${
                          isDarkMode 
                            ? 'text-white border-slate-700' 
                            : 'text-slate-700 border-slate-200'
                        }`}>{student.id}</td>
                        <td className={`px-3 py-2 text-sm border-b ${
                          isDarkMode 
                            ? 'text-white border-slate-700' 
                            : 'text-slate-700 border-slate-200'
                        }`}>{student.name}</td>
                        <td className={`px-3 py-2 border-b ${
                          isDarkMode ? 'border-slate-700' : 'border-slate-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <label htmlFor={`grade-score-${studentId}`} className="sr-only">Score for {student.name}</label>
                              <input
                                id={`grade-score-${studentId}`}
                                name={`grade-score-${studentId}`}
                                type="number"
                                value={quickGradeScores[studentId] || ''}
                                onChange={(e) => setQuickGradeScores(prev => ({ ...prev, [studentId]: e.target.value }))}
                                placeholder="Score"
                                className={`w-32 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-maroon-500 ${
                                  (() => {
                                    const score = parseFloat(quickGradeScores[studentId])
                                    const maxPoints = parseFloat(quickGradeMaxPoints)
                                    const isInvalid = !isNaN(score) && !isNaN(maxPoints) && score > maxPoints
                                    return isInvalid
                                      ? isDarkMode
                                        ? 'bg-[#1a1a1a] border-red-500 text-white focus:ring-red-500'
                                        : 'bg-red-50 border-red-500 text-red-900 focus:ring-red-500'
                                      : isDarkMode
                                        ? 'bg-[#1a1a1a] border-slate-600 text-white'
                                        : 'bg-white border-slate-300'
                                  })()
                                }`}
                              />
                            </div>
                            {(() => {
                              const score = parseFloat(quickGradeScores[studentId])
                              const maxPoints = parseFloat(quickGradeMaxPoints)
                              const isInvalid = !isNaN(score) && !isNaN(maxPoints) && score > maxPoints
                              return isInvalid ? (
                                <span className={`text-xs font-medium whitespace-nowrap ${
                                  isDarkMode ? 'text-red-400' : 'text-red-600'
                                }`} title={`Score exceeds maximum of ${maxPoints}`}>
                                  Max: {maxPoints}
                                </span>
                              ) : null
                            })()}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Fill Score Modal */}
      {showFillScoreModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl ${
            isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>Fill All Scores</h3>
            <p className={`mb-4 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>Enter a score to apply to all students:</p>
            <input
              type="number"
              value={fillScoreValue}
              onChange={(e) => setFillScoreValue(e.target.value)}
              placeholder="Enter score"
              className={`w-full px-4 py-2 rounded-lg border mb-4 ${
                isDarkMode 
                  ? 'bg-[#2c2c2c] text-white border-slate-600' 
                  : 'bg-white border-slate-300'
              }`}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={onFillScoreCancel}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={onFillScoreSubmit}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GradesTab

