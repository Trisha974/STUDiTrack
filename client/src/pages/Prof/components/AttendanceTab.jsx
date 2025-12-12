import React, { useEffect, useState } from 'react'
import { useTheme } from '../../../hooks/useTheme'
import StudentAvatar from '../../../components/StudentAvatar/StudentAvatar'
import { normalizeStudentId } from '../../../utils/validationHelpers'
import { findStudentById } from '../../../utils/studentHelpers'

const AttendanceTab = ({
  currentSubject,
  attendanceDate,
  setAttendanceDate,
  currentTime,
  setCurrentTime,
  records,
  setRecords,
  enrolls,
  students,
  subjects,
  profUid,
  alerts,
  setAlerts,
  onBackToSubjects,
  onSaveAttendance,
  onExportCSV,
  onToggleAttendance,
  onSelectAllPresent,
  onGetAttendanceStatus,
  onUpdateAttendanceSummary,
  onAreAllStudentsPresent,
  onGetCurrentDate,
  onGetDateDisplay,
  saveData,
  addCustomAlert,
  toastMessage,
  setToastMessage
}) => {
  const { isDarkMode } = useTheme()
  const [lastAutoSaveMessageRef] = useState({ current: null })


  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
      setCurrentTime(timeString)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [setCurrentTime])

  if (!currentSubject) {
    return (
      <div className="glass rounded-2xl shadow-xl p-8">
        <div className="text-center py-12">
          <p className="text-slate-600 text-lg mb-4">No subject selected</p>
          <p className="text-slate-500">Click on a subject and then click "Take Attendance" to manage attendance</p>
        </div>
      </div>
    )
  }

  const summary = onUpdateAttendanceSummary ? onUpdateAttendanceSummary() : { present: 0, absent: 0, total: 0, rate: 0 }
  const allPresent = onAreAllStudentsPresent ? onAreAllStudentsPresent() : false

  return (
    <div className={`glass rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 ${isDarkMode ? 'bg-[#1a1a1a]' : ''}`}>
      {/* Subject Header */}
      <div className="flex items-center justify-between space-x-3 sm:space-x-4 mb-4 sm:mb-5 lg:mb-6">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          <button
            onClick={onBackToSubjects}
            className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-slate-100 hover:bg-slate-200 rounded-lg sm:rounded-xl flex items-center justify-center transition-all flex-shrink-0"
          >
            <svg className="w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold textGrad break-words">{currentSubject.name}</h2>
            <p className={`text-sm sm:text-base mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{currentSubject.code} • {currentSubject.credits} Credits</p>
          </div>
        </div>
        <button
          onClick={onExportCSV}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2 text-sm sm:text-base flex-shrink-0"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Toast Message */}
      {toastMessage && (
        <div className="mb-4 p-3 bg-emerald-500 text-white rounded-lg text-center font-medium">
          {toastMessage}
        </div>
      )}

      {/* Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-4 mb-5 sm:mb-6 lg:mb-8">
        {/* Live Date & Time Display */}
        <div className="timeBox rounded-lg sm:rounded-xl px-3 sm:px-4 lg:px-5 xl:px-6 py-2.5 sm:py-3 lg:py-3.5 xl:py-4 shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 mb-1">
              <div className="w-1.5 h-1.5 indicator rounded-full"></div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Live Time</div>
            </div>
            <div className="dateText text-sm sm:text-base mb-0.5">{onGetCurrentDate ? onGetCurrentDate() : new Date().toLocaleDateString()}</div>
            <div className="timeText text-base sm:text-lg">{currentTime}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium">
              <span>{Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC+8'}</span>
            </div>
          </div>
        </div>
        
        {/* Date Selection */}
        <div className="flex flex-col space-y-1.5">
          <label htmlFor="attendance-date" className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Attendance Date</label>
          <input
            id="attendance-date"
            name="attendance-date"
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className={`form-input-field focus:ring-2 focus:ring-maroon-500 text-sm sm:text-base py-2 ${isDarkMode ? 'bg-[#2c2c2c] text-white border-slate-600' : ''}`}
          />
          <div className={`text-[10px] sm:text-xs text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>{onGetDateDisplay ? onGetDateDisplay() : attendanceDate}</span>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex flex-col items-stretch lg:items-center space-y-1.5 sm:space-y-2 lg:col-span-1">
          <div className={`flex items-center justify-center lg:justify-start space-x-1.5 sm:space-x-2 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-saving</span>
          </div>
          <button
            onClick={onSaveAttendance}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base w-full"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" />
            </svg>
            <span>Save Attendance</span>
          </button>
        </div>
      </div>
      
      {/* Attendance Summary */}
      <div className="mb-4 sm:mb-5 lg:mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-3.5 lg:p-4 ${isDarkMode ? 'bg-emerald-900/20 border-emerald-700/50' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Present</p>
              <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>{summary.present}</p>
            </div>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-emerald-800/30' : 'bg-emerald-100'}`}>
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-3.5 lg:p-4 ${isDarkMode ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Absent</p>
              <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{summary.absent}</p>
            </div>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-red-800/30' : 'bg-red-100'}`}>
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-3.5 lg:p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Total Students</p>
              <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>{summary.total}</p>
            </div>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-blue-800/30' : 'bg-blue-100'}`}>
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className={`border rounded-lg sm:rounded-xl p-3 sm:p-3.5 lg:p-4 ${isDarkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className={`font-medium text-xs sm:text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>Attendance Rate</p>
              <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>{summary.rate}%</p>
            </div>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-amber-800/30' : 'bg-amber-100'}`}>
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Attendance List */}
      <div className="space-y-3 sm:space-y-4">
        {/* Select All Button */}
        {currentSubject && enrolls[currentSubject.code] && enrolls[currentSubject.code].length > 0 && !allPresent && (
          <div className="mb-3 sm:mb-4">
            <button
              onClick={onSelectAllPresent}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Select All Present</span>
            </button>
          </div>
        )}
        {currentSubject && enrolls[currentSubject.code] && enrolls[currentSubject.code].length > 0 ? (
          enrolls[currentSubject.code].map(studentId => {
            const student = findStudentById(students, studentId)
            if (!student) return null
            const status = onGetAttendanceStatus ? onGetAttendanceStatus(studentId) : null
            return (
              <div
                key={studentId}
                className={`flex flex-col sm:flex-row sm:justify-between sm:items-center border rounded-lg sm:rounded-xl p-3.5 sm:p-4 transition-all hover:shadow-md gap-3 ${
                  isDarkMode 
                    ? 'bg-[#1a1a1a] border-slate-700' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 flex-grow min-w-0">
                  <StudentAvatar student={student} className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0" />
                  <div className="flex-grow min-w-0">
                    <p className={`font-semibold truncate text-sm sm:text-base ${
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>{student.name}</p>
                    <p className={`text-xs sm:text-sm truncate ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>ID: {student.id}</p>
                  </div>
                </div>
                <div className="flex space-x-2 sm:flex-shrink-0">
                  <button
                    onClick={() => onToggleAttendance(studentId, 'present')}
                    className={`flex-1 sm:flex-none sm:w-20 lg:w-24 px-4 sm:px-4 py-2.5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      status === 'present'
                        ? isDarkMode
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 text-emerald-700'
                        : isDarkMode
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => onToggleAttendance(studentId, 'absent')}
                    className={`flex-1 sm:flex-none sm:w-20 lg:w-24 px-4 sm:px-4 py-2.5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      status === 'absent'
                        ? isDarkMode
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-700'
                        : isDarkMode
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center text-slate-500 py-8">
            No students enrolled in this subject.
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceTab

