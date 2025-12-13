import React, { useRef, useMemo } from 'react'
import { useTheme } from '../../../hooks/useTheme'
import { normalizeStudentId } from '../../../utils/validationHelpers'
import { findStudentById } from '../../../utils/studentHelpers'

const AddStudentModal = ({
  isOpen,
  onClose,

  addStudentModalTab,
  setAddStudentModalTab,

  csvFile,
  setCsvFile,
  csvPreview,
  setCsvPreview,
  csvImportWarnings,
  setCsvImportWarnings,
  isImporting,
  handleFileSelect,
  handleImportCSV,

  selectedStudentsForBulk,
  setSelectedStudentsForBulk,
  selectedSubjectsForBulk,
  setSelectedSubjectsForBulk,
  selectAllStudents,
  setSelectAllStudents,
  archivedStudentDetailView,
  setArchivedStudentDetailView,
  studentSearchTerm,
  setStudentSearchTerm,
  showSearchDropdown,
  setShowSearchDropdown,

  studentSubjectFilter,
  setStudentSubjectFilter,

  newStudent,
  setNewStudent,

  restoreSubjectDropdownRef,
  newStudentSubjectDropdownRef,
  showRestoreSubjectDropdown,
  setShowRestoreSubjectDropdown,
  showNewStudentSubjectDropdown,
  setShowNewStudentSubjectDropdown,

  subjects,
  students,
  enrolls,

  handleRestoreStudent,
  handleAddStudent,
  toggleRestoreSubjectSelection,
  toggleNewStudentSubjectSelection,
  getSubjectLabel,
  addCustomAlert,

  selectedStudentIdSet,

  saveData,
  alerts,
  setAlerts,
  records,
  grades,
  setStudents,
  setNormalizedEnrolls,
  setGrades,
  setRecords,
  profUid
}) => {
  const { isDarkMode } = useTheme()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 modal items-center justify-center z-50 p-4 flex" onClick={() => {
      onClose()
      setAddStudentModalTab('import')
      setSelectedStudentsForBulk([])
      setSelectedSubjectsForBulk([])
      setSelectAllStudents(false)
      setStudentSearchTerm('')
      setShowSearchDropdown(false)
      setArchivedStudentDetailView(null)
      setCsvFile(null)
      setCsvPreview([])
    }}>
      <div className="glass rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-5">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#7A1315] via-[#b11e22] to-[#f97373] shadow-2xl flex items-center justify-center border-2 border-white/20 transform rotate-3 hover:rotate-6 transition-transform duration-300">
              <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0v1.25A.75.75 0 0119.25 22H4.75A.75.75 0 014 21.25V20z" />
              </svg>
            </div>
            {/* Add badge with animation */}
            <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-[#7A1315] shadow-xl border-2 border-red-100 animate-pulse">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
            </span>
          </div>
          <h3 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>Student Management</h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>Enroll existing students or create new profiles</p>
        </div>

        {/* Tab Navigation */}
        <div className={`flex flex-col gap-4 mb-6 border-b pb-4 ${
          isDarkMode ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className={`flex flex-wrap gap-2 p-1 rounded-2xl shadow-inner ${
            isDarkMode ? 'bg-[#111317]' : 'bg-slate-100'
          }`}>
            <button
              onClick={() => {
                setAddStudentModalTab('import')
                setCsvFile(null)
                setCsvPreview([])
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                addStudentModalTab === 'import'
                  ? isDarkMode
                    ? 'bg-[#7A1315] text-white shadow-lg shadow-red-900/40'
                    : 'bg-white text-maroon-600 shadow-md'
                  : isDarkMode
                    ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Import File
            </button>
            <button
              onClick={() => {
                setAddStudentModalTab('archived')
                setSelectedStudentsForBulk([])
                setSelectedSubjectsForBulk([])
                setSelectAllStudents(false)
                setStudentSearchTerm('')
                setShowSearchDropdown(false)
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                addStudentModalTab === 'archived'
                  ? isDarkMode
                    ? 'bg-[#7A1315] text-white shadow-lg shadow-red-900/40'
                    : 'bg-white text-maroon-600 shadow-md'
                  : isDarkMode
                    ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Archived Students
            </button>
            <button
              onClick={() => {
                setAddStudentModalTab('create')
                setSelectedStudentsForBulk([])
                setSelectedSubjectsForBulk([])
                setSelectAllStudents(false)
                setStudentSearchTerm('')
                setShowSearchDropdown(false)
              }}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                addStudentModalTab === 'create'
                  ? isDarkMode
                    ? 'bg-[#7A1315] text-white shadow-lg shadow-red-900/40'
                    : 'bg-white text-maroon-600 shadow-md'
                  : isDarkMode
                    ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Create New Student
            </button>
          </div>

          {/* Inline CSV import warnings – only shown in Import File tab */}
          {addStudentModalTab === 'import' && csvImportWarnings?.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {csvImportWarnings.map((warning, index) => (
                <div
                  key={`csv-warning-modal-${index}`}
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 border text-sm ${
                    warning.type === 'error'
                      ? (isDarkMode ? 'bg-red-900/20 border-red-700 text-red-100' : 'bg-red-50 border-red-200 text-red-700')
                      : warning.type === 'success'
                        ? (isDarkMode ? 'bg-emerald-900/20 border-emerald-700 text-emerald-100' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
                        : (isDarkMode ? 'bg-amber-900/20 border-amber-700 text-amber-100' : 'bg-amber-50 border-amber-200 text-amber-700')
                  }`}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold">{warning.title || 'Import Warning'}</p>
                    <p>{warning.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCsvImportWarnings(prev => prev.filter((_, i) => i !== index))
                    }}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                      warning.type === 'error'
                        ? (isDarkMode ? 'bg-red-800 text-white' : 'bg-red-600 text-white')
                        : warning.type === 'success'
                          ? (isDarkMode ? 'bg-emerald-800 text-white' : 'bg-emerald-600 text-white')
                          : (isDarkMode ? 'bg-amber-800 text-white' : 'bg-amber-600 text-white')
                    }`}
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Search Bar - Only show when Archived Students tab is active */}
          {addStudentModalTab === 'archived' && (
            <div className="flex items-center">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={studentSearchTerm}
                  onChange={(e) => {
                    setStudentSearchTerm(e.target.value)
                    setShowSearchDropdown(true)
                  }}
                  onFocus={() => {
                    if (studentSearchTerm.trim()) {
                      setShowSearchDropdown(true)
                    }
                  }}
                  onBlur={() => {

                    setTimeout(() => setShowSearchDropdown(false), 200)
                  }}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border focus:ring-2 focus:ring-maroon-500 focus:outline-none text-sm ${
                    isDarkMode 
                      ? 'bg-[#1b1b1b] text-white border-slate-600 placeholder-slate-400' 
                      : 'bg-white text-slate-800 border-slate-300 placeholder-slate-400'
                  }`}
                />
                <svg 
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-400'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {studentSearchTerm && (
                  <button
                    onClick={() => {
                      setStudentSearchTerm('')
                      setShowSearchDropdown(false)
                    }}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                {/* Autocomplete Dropdown */}
                {showSearchDropdown && studentSearchTerm.trim() && (() => {

                  const filteredStudents = students.filter(student => {

                    const matchesSubjectFilter = selectedSubjectsForBulk.length === 0
                      ? (student.archivedSubjects || []).length > 0
                      : selectedSubjectsForBulk.some(subjectCode => 
                          (student.archivedSubjects || []).includes(subjectCode)
                        )
                    
                    if (!matchesSubjectFilter) return false
                    

                    const searchLower = studentSearchTerm.toLowerCase().trim()
                    const nameMatch = student.name?.toLowerCase().includes(searchLower) || false
                    const idMatch = student.id?.toString().includes(searchLower) || false
                    
                    return nameMatch || idMatch
                  }).slice(0, 10)
                  
                  if (filteredStudents.length === 0) return null
                  
                  return (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {filteredStudents.map(student => {
                        const normalizedId = normalizeStudentId(student.id)
                        const isSelected = selectedStudentIdSet.has(normalizedId)
                        return (
                          <div
                            key={student.id}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              if (isSelected) {
                                setSelectedStudentsForBulk(selectedStudentsForBulk.filter(id => normalizeStudentId(id) !== normalizedId))
                              } else {
                                setSelectedStudentsForBulk([...selectedStudentsForBulk, normalizedId])
                              }
                              setShowSearchDropdown(false)
                              setSelectAllStudents(false)
                            }}
                            className={`px-4 py-2 cursor-pointer hover:bg-amber-50 transition-colors flex items-center justify-between ${
                              isSelected ? 'bg-amber-100' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <div className="font-medium text-slate-800">{student.name}</div>
                              <div className="text-xs text-slate-500">ID: {student.id}</div>
                            </div>
                            {isSelected && (
                              <svg className="w-5 h-5 text-maroon-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {addStudentModalTab === 'import' ? (
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
                      Choose the class that will receive the uploaded students.
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
                        Please select a subject to enable the import button.
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
                          Upload CSV or Excel File
                        </h4>
                      </div>
                    </div>
                    <p className={`text-sm ml-13 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Use the official template (ID, Name, Email). We'll validate everything before saving.
                    </p>
                  </div>
                  {csvFile && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-sm ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {Math.round(csvFile.size / 1024)} KB
                    </div>
                  )}
                </div>
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDarkMode
                    ? csvFile 
                      ? 'border-[#7A1315]/50 bg-[#7A1315]/10 ring-2 ring-[#7A1315]/30' 
                      : 'border-slate-600 bg-[#151515]/60 hover:border-slate-500 hover:bg-[#151515]/80'
                    : csvFile 
                      ? 'border-[#7A1315]/50 bg-[#7A1315]/5 ring-2 ring-[#7A1315]/20' 
                      : 'border-slate-300 bg-slate-50/70 hover:border-[#7A1315]/30 hover:bg-slate-100/70'
                }`}>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        handleFileSelect(file)
                      } else {
                        setCsvFile(null)
                        setCsvPreview([])
                      }
                    }}
                    className="hidden"
                    id="csvFileInput"
                  />
                  <label
                    htmlFor="csvFileInput"
                    className="cursor-pointer flex flex-col items-center space-y-4"
                  >
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                      isDarkMode 
                        ? csvFile ? 'bg-[#7A1315]/20' : 'bg-slate-800/50' 
                        : csvFile ? 'bg-[#7A1315]/10' : 'bg-slate-100'
                    }`}>
                      <svg className={`w-10 h-10 ${csvFile ? 'text-[#7A1315]' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <span className={`text-base font-bold block mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {csvFile ? (
                          <span className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {csvFile.name}
                          </span>
                        ) : (
                          'Click to upload CSV or Excel file'
                        )}
                      </span>
                      <span className={`text-xs block mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Supported formats: CSV, XLSX, XLS · Required columns: ID, Name, Email
                      </span>
                    </div>
                  </label>
                  {csvFile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setCsvFile(null)
                        setCsvPreview([])

                        const fileInput = document.getElementById('csvFileInput')
                        if (fileInput) fileInput.value = ''
                      }}
                      className={`mt-4 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isDarkMode 
                          ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-800/50' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Remove file
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {csvPreview.length > 0 ? (() => {

                const idCountMap = new Map()
                csvPreview.forEach((student, index) => {
                  const id = normalizeStudentId((student.id || '').trim())
                  if (id) {
                    if (idCountMap.has(id)) {
                      idCountMap.get(id).push(index)
                    } else {
                      idCountMap.set(id, [index])
                    }
                  }
                })
                const duplicateIndices = new Set()
                idCountMap.forEach((indices) => {
                  if (indices.length > 1) {
                    indices.forEach(idx => duplicateIndices.add(idx))
                  }
                })


                const currentEnrolledIds = new Set(
                  (enrolls[studentSubjectFilter] || []).map(id => normalizeStudentId(id))
                )

                return (
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
                          3
                        </div>
                        <div>
                          <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>Step 3</p>
                          <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Preview ({csvPreview.length} {csvPreview.length === 1 ? 'student' : 'students'})
                            {duplicateIndices.size > 0 && (
                              <span className={`ml-2 text-xs font-normal ${
                                isDarkMode ? 'text-amber-400' : 'text-amber-600'
                              }`}>
                                ({duplicateIndices.size} duplicate{duplicateIndices.size > 1 ? 's' : ''})
                              </span>
                            )}
                          </h4>
                        </div>
                      </div>
                      <button
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                          isDarkMode 
                            ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                        onClick={() => setCsvPreview([])}
                      >
                        Clear Preview
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="min-w-full">
                        <thead className={isDarkMode ? 'bg-slate-800/50 sticky top-0' : 'bg-slate-100 sticky top-0'}>
                          <tr>
                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                              isDarkMode ? 'text-slate-300' : 'text-slate-600'
                            }`}>ID</th>
                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                              isDarkMode ? 'text-slate-300' : 'text-slate-600'
                            }`}>Name</th>
                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                              isDarkMode ? 'text-slate-300' : 'text-slate-600'
                            }`}>Email</th>
                            <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${
                              isDarkMode ? 'text-slate-300' : 'text-slate-600'
                            }`}>Status</th>
                          </tr>
                        </thead>
                        <tbody className={isDarkMode ? 'divide-slate-800' : 'divide-slate-200'}>
                          {csvPreview.map((student, index) => {
                            const id = normalizeStudentId((student.id || '').trim())
                            const isDuplicate = duplicateIndices.has(index)
                            const isAlreadyEnrolled = currentEnrolledIds.has(id)
                            
                            return (
                              <tr key={index} className={`${
                                isDuplicate || isAlreadyEnrolled
                                  ? isDarkMode
                                    ? 'bg-amber-900/20 border-l-4 border-amber-600'
                                    : 'bg-amber-50 border-l-4 border-amber-400'
                                  : isDarkMode 
                                    ? index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#151515]' 
                                    : index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                              } hover:bg-opacity-80 transition-colors`}>
                                <td className={`px-4 py-3 text-sm font-semibold ${
                                  isDarkMode ? 'text-white' : 'text-slate-800'
                                }`}>{student.id}</td>
                                <td className={`px-4 py-3 text-sm ${
                                  isDarkMode ? 'text-slate-200' : 'text-slate-800'
                                }`}>{student.name}</td>
                                <td className={`px-4 py-3 text-sm ${
                                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                                }`}>{student.email ? student.email : 'N/A'}</td>
                                <td className="px-4 py-3">
                                  {isDuplicate && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                                      isDarkMode
                                        ? 'bg-amber-900/40 text-amber-300 border border-amber-700'
                                        : 'bg-amber-100 text-amber-700 border border-amber-300'
                                    }`}>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                      </svg>
                                      Duplicate
                                    </span>
                                  )}
                                  {!isDuplicate && isAlreadyEnrolled && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                                      isDarkMode
                                        ? 'bg-blue-900/40 text-blue-300 border border-blue-700'
                                        : 'bg-blue-100 text-blue-700 border border-blue-300'
                                    }`}>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Enrolled
                                    </span>
                                  )}
                                  {!isDuplicate && !isAlreadyEnrolled && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                                      isDarkMode
                                        ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'
                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                    }`}>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 4v16m8-8H4" />
                                      </svg>
                                      New
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })() : csvFile ? (
                <div className={`mt-4 p-4 rounded-2xl border ${
                  isDarkMode ? 'bg-amber-900/20 border-amber-700 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <p className="text-sm font-semibold">
                    ⚠️ No data found in file
                  </p>
                  <p className="text-xs mt-1">
                    Please check that your file contains columns labeled "ID" (or "Student ID") and "Name" (or "Student Name").
                  </p>
                  <p className="text-xs mt-1">
                    Check the browser console (F12) for detailed parsing information.
                  </p>
                </div>
              ) : null}

              <div className={`flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 pt-6 border-t-2 ${
                isDarkMode ? 'border-slate-700' : 'border-slate-200'
              }`}>
                <button
                  onClick={() => {
                    onClose()
                    setCsvFile(null)
                    setCsvPreview([])
                    setStudentSubjectFilter('')
                  }}
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
                    
                    console.log('🚀 Add Student button clicked:', { 
                      csvFile: csvFile?.name, 
                      subject: studentSubjectFilter, 
                      previewCount: csvPreview.length,
                      hasFile: !!csvFile,
                      hasSubject: !!studentSubjectFilter,
                      isImporting,
                      previewData: csvPreview,
                      subjectsAvailable: subjects.length
                    })
                    

                    if (!csvFile) {
                      console.error('❌ Validation failed: No file')
                      addCustomAlert('error', 'No File', 'Please upload a CSV or Excel file first.', false)
                      return
                    }
                    if (!studentSubjectFilter) {
                      console.error('❌ Validation failed: No subject selected')
                      addCustomAlert('error', 'No Subject Selected', 'Please select a subject to enroll students.', false)
                      return
                    }
                    if (csvPreview.length === 0) {
                      console.error('❌ Validation failed: No preview data', { csvPreview })
                      addCustomAlert('error', 'No Data', 'The file appears to be empty or could not be parsed. Please check the file format and try again.', false)
                      return
                    }
                    
                    try {
                      console.log('✅ All validations passed, calling handleImportCSV...')
                      await handleImportCSV()
                      console.log('✅ handleImportCSV completed')
                    } catch (error) {
                      console.error('❌ Error in handleImportCSV:', error)
                      setCsvImportWarnings(prev => [
                        ...prev,
                        {
                          type: 'error',
                          title: 'Import Failed',
                          message: `Failed to import students: ${error.message}. Please check the console (F12) for details.`,
                          summary: true,
                        },
                      ])
                    }
                  }}
                  disabled={!csvFile || !studentSubjectFilter || csvPreview.length === 0 || isImporting}
                  className={`group relative overflow-hidden px-8 py-3 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-[#7A1315] to-[#b91c1c] hover:from-[#8a1518] hover:to-[#c91d1d]'
                      : 'bg-gradient-to-r from-[#7A1315] to-[#b91c1c] hover:from-[#8a1518] hover:to-[#c91d1d]'
                  }`}
                  title={
                    !csvFile ? 'Please upload a file first' :
                    !studentSubjectFilter ? 'Please select a subject first' :
                    csvPreview.length === 0 ? `No data found. Check console (F12) for details. Expected: ID, Name, Email columns.` :
                    isImporting ? 'Import in progress...' :
                    `Click to import ${csvPreview.length} student${csvPreview.length !== 1 ? 's' : ''}`
                  }
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {isImporting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Importing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4v16m8-8H4" />
                        </svg>
                        Add Student{csvPreview.length > 0 ? ` (${csvPreview.length})` : ''}
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          ) : addStudentModalTab === 'archived' ? (
            <div className="space-y-6">
              {/* Subject Selection */}
              <div className={`rounded-2xl border shadow-md px-5 py-4 ${
                isDarkMode ? 'bg-[#1b1b1b] border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider font-semibold text-maroon-500 mb-1">Recovery Scope</p>
                    <h4 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Select Subjects to Restore From
                    </h4>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Choose one or more subjects to re-enroll archived students.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubjectsForBulk([])}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const allSubjects = subjects.map(subject => subject.code)
                        setSelectedSubjectsForBulk(allSubjects)
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-emerald-700 text-white hover:bg-emerald-600'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      Select All
                    </button>
                  </div>
                </div>
                <div className="mt-4 relative" ref={restoreSubjectDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowRestoreSubjectDropdown(prev => !prev)}
                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all hover:shadow-md ${
                      isDarkMode 
                        ? 'border-slate-600 bg-[#0f0f0f] hover:bg-[#151515]' 
                        : 'border-slate-300 bg-white hover:border-maroon-300'
                    }`}
                  >
                    <div className="pr-4 flex-1 min-w-0">
                      <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {selectedSubjectsForBulk.length > 0
                          ? `${selectedSubjectsForBulk.length} subject${selectedSubjectsForBulk.length === 1 ? '' : 's'} selected`
                          : 'No subjects selected'}
                      </p>
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} truncate`}>
                        {selectedSubjectsForBulk.length > 0
                          ? selectedSubjectsForBulk.map(getSubjectLabel).join(', ')
                          : 'Click to choose subjects'}
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${
                        showRestoreSubjectDropdown ? 'rotate-180' : ''
                      } ${isDarkMode ? 'text-slate-400' : 'text-maroon-600'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showRestoreSubjectDropdown && (
                    <div
                      className={`absolute z-40 mt-2 w-full rounded-2xl border shadow-2xl ${

                        'bg-white border-slate-200'
                      }`}
                    >
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {subjects.length === 0 ? (
                          <p className={`text-sm px-4 py-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            No subjects available.
                          </p>
                        ) : (
                          subjects.map(subject => {
                            const checked = selectedSubjectsForBulk.includes(subject.code)
                            return (
                              <label
                                key={subject.code}
                                className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-slate-50"
                                onMouseDown={e => e.preventDefault()}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleRestoreSubjectSelection(subject.code)}
                                    className="form-checkbox h-4 w-4 text-maroon-600 rounded"
                                  />
                                  <span className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                                    {subject.code} — {subject.name}
                                  </span>
                                </div>
                                {checked && (
                                  <svg className="w-4 h-4 text-maroon-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </label>
                            )
                          })
                        )}
                      </div>
                      <div className={`flex items-center justify-end gap-3 px-4 py-2 border-t ${
                        isDarkMode ? 'border-slate-700' : 'border-slate-100'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setShowRestoreSubjectDropdown(false)}
                          className="text-sm font-semibold text-maroon-600 hover:text-maroon-800"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Archived Student Selection List */}
              <div>
                <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 p-4 rounded-xl ${
                  isDarkMode ? 'bg-[#1b1b1b] border border-slate-700' : 'bg-slate-50 border border-slate-200'
                }`}>
                  <div>
                    <label className={`block text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      Select Archived Students
                    </label>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {selectedStudentsForBulk.length} student{selectedStudentsForBulk.length === 1 ? '' : 's'} selected
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const archivedStudents = students.filter(student => {

                          const matchesSubjectFilter = selectedSubjectsForBulk.length === 0
                            ? (student.archivedSubjects || []).length > 0
                            : selectedSubjectsForBulk.some(subjectCode => 
                                (student.archivedSubjects || []).includes(subjectCode)
                              )
                          
                          if (!matchesSubjectFilter) return false
                          

                          if (studentSearchTerm.trim() === '') return true
                          
                          const searchLower = studentSearchTerm.toLowerCase().trim()
                          const nameMatch = student.name?.toLowerCase().includes(searchLower) || false
                          const idMatch = student.id?.toString().includes(searchLower) || false
                          
                          return nameMatch || idMatch
                        })
                        
                        if (selectAllStudents) {
                          setSelectedStudentsForBulk([])
                          setSelectAllStudents(false)
                        } else {
                          setSelectedStudentsForBulk(archivedStudents.map(s => normalizeStudentId(s.id)).filter(Boolean))
                          setSelectAllStudents(true)
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${
                        selectAllStudents
                          ? isDarkMode
                            ? 'bg-maroon-600 text-white hover:bg-maroon-700'
                            : 'bg-maroon-600 text-white hover:bg-maroon-700'
                          : isDarkMode
                            ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {selectAllStudents ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={async () => {
                        if (selectedStudentsForBulk.length === 0) {
                          addCustomAlert('warning', 'No Selection', 'Please select at least one archived student to delete.', false)
                          return
                        }
                        
                        if (!window.confirm(`Delete ${selectedStudentsForBulk.length} selected student(s)? This action cannot be undone.`)) {
                          return
                        }
                        

                        const selectedIdSet = new Set(selectedStudentsForBulk.map(normalizeStudentId))
                        let updatedEnrolls = { ...enrolls }
                        Object.keys(updatedEnrolls).forEach(subjectCode => {
                          updatedEnrolls[subjectCode] = (updatedEnrolls[subjectCode] || []).filter(
                            id => !selectedIdSet.has(normalizeStudentId(id))
                          )
                        })
                        

                        const updatedStudents = students.filter(
                          s => !selectedIdSet.has(normalizeStudentId(s.id))
                        )
                        

                        const updatedGrades = { ...grades }
                        Object.keys(updatedGrades).forEach(key => {
                          const grade = updatedGrades[key]
                          if (grade && selectedStudentIdSet.has(normalizeStudentId(grade.studentId))) {
                            delete updatedGrades[key]
                          }
                        })
                        
                        const updatedRecords = { ...records }
                        Object.keys(updatedRecords).forEach(key => {
                          const record = updatedRecords[key]
                          if (record && selectedStudentIdSet.has(normalizeStudentId(record.studentId))) {
                            delete updatedRecords[key]
                          }
                        })
                        
                        setStudents(updatedStudents)
                        setNormalizedEnrolls(updatedEnrolls)
                        setGrades(updatedGrades)
                        setRecords(updatedRecords)
                        
                        const newAlert = {
                          id: Date.now(),
                          type: 'general',
                          title: 'Students Deleted',
                          message: `Deleted ${selectedStudentsForBulk.length} archived student(s).`,
                          timestamp: new Date(),
                          read: false,
                        }
                        const updatedAlerts = [newAlert, ...alerts]
                        setAlerts(updatedAlerts)
                        
                        await saveData(subjects, updatedStudents, updatedEnrolls, updatedAlerts, updatedRecords, updatedGrades, profUid, true)
                        
                        setSelectedStudentsForBulk([])
                        setSelectAllStudents(false)
                        
                        addCustomAlert('success', 'Students Deleted', 'Selected archived students were removed permanently.', false)
                      }}
                      disabled={selectedStudentsForBulk.length === 0}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${
                        selectedStudentsForBulk.length === 0
                          ? isDarkMode
                            ? 'bg-red-900/30 text-red-400 cursor-not-allowed border border-red-800'
                            : 'bg-red-100 text-red-400 cursor-not-allowed border border-red-200'
                          : isDarkMode
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      Delete Selected
                    </button>
                  </div>
                </div>
                
                {/* Scrollable Archived Student List */}
                <div className={`border rounded-2xl overflow-hidden shadow-inner ${
                  isDarkMode 
                    ? 'border-slate-700 bg-[#1b1b1b]' 
                    : 'border-amber-200 bg-gradient-to-br from-amber-50/60 to-amber-100/30'
                }`}>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar">
                    {students
                      .filter(student => {

                        const matchesSubjectFilter = selectedSubjectsForBulk.length === 0
                          ? (student.archivedSubjects || []).length > 0
                          : selectedSubjectsForBulk.some(subjectCode => 
                              (student.archivedSubjects || []).includes(subjectCode)
                            )
                        
                        if (!matchesSubjectFilter) return false
                        

                        if (studentSearchTerm.trim() === '') return true
                        
                        const searchLower = studentSearchTerm.toLowerCase().trim()
                        const nameMatch = student.name?.toLowerCase().includes(searchLower) || false
                        const idMatch = student.id?.toString().includes(searchLower) || false
                        
                        return nameMatch || idMatch
                      })
                      .map(student => {
                        const normalizedId = normalizeStudentId(student.id)
                        const isSelected = selectedStudentIdSet.has(normalizedId)
                        const enrolledIn = Object.keys(enrolls).filter(code => 
                          (enrolls[code] || []).some(id => normalizeStudentId(id) === normalizedId)
                        )
                        const archivedFrom = student.archivedSubjects || []
                        const archivedFromSelected = selectedSubjectsForBulk.length > 0
                          ? archivedFrom.filter(code => selectedSubjectsForBulk.includes(code))
                          : archivedFrom
                        
                        return (
                          <div key={student.id}>
                            <div
                              className={`flex items-center space-x-3 px-4 py-3 border-b transition-colors cursor-pointer ${
                                isSelected 
                                  ? isDarkMode
                                    ? 'bg-slate-700/50 border-slate-600'
                                    : 'bg-amber-100 border-amber-200'
                                  : isDarkMode
                                    ? 'border-slate-700 hover:bg-slate-800/50'
                                    : 'border-amber-100 hover:bg-amber-50'
                              }`}
                              onClick={(e) => {

                                if (e.target.type !== 'checkbox') {
                                  setArchivedStudentDetailView(
                                    archivedStudentDetailView === student.id ? null : student.id
                                  )
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  if (e.target.checked) {
                                    setSelectedStudentsForBulk([...selectedStudentsForBulk, normalizedId])
                                    setSelectAllStudents(false)
                                  } else {
                                    setSelectedStudentsForBulk(selectedStudentsForBulk.filter(id => normalizeStudentId(id) !== normalizedId))
                                    setSelectAllStudents(false)
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-5 h-5 text-maroon-600 border-slate-300 rounded focus:ring-maroon-500 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-amber-900">{student.name}</div>
                                <div className="text-xs text-amber-700">ID: {student.id}</div>
                                {archivedFromSelected.length > 0 && (
                                  <div className="text-xs text-amber-600 mt-1">
                                    Archived from {archivedFromSelected.length} selected subject(s)
                                  </div>
                                )}
                                {enrolledIn.length > 0 && (
                                  <div className="text-xs text-slate-400 mt-1">
                                    Also enrolled in {enrolledIn.length} other subject(s)
                                  </div>
                                )}
                              </div>
                              <svg 
                                className={`w-5 h-5 text-amber-600 transition-transform ${
                                  archivedStudentDetailView === student.id ? 'rotate-180' : ''
                                }`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            
                            {/* Detailed View */}
                            {archivedStudentDetailView === student.id && (
                              <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-4 space-y-4">
                                {/* Removed Subjects (Archived History) */}
                                <div>
                                  <h5 className="text-sm font-bold text-amber-900 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Removed Subjects (Archived History)
                                  </h5>
                                  {archivedFrom.length > 0 ? (
                                    <div className="space-y-2">
                                      {archivedFrom.map(subjectCode => {
                                        const subject = subjects.find(s => s.code === subjectCode)
                                        return (
                                          <div key={subjectCode} className="bg-white rounded-lg p-3 border border-amber-200">
                                            <div className="text-sm font-semibold text-amber-900">
                                              {subject ? subject.name : subjectCode}
                                            </div>
                                            <div className="text-xs text-amber-600 mt-1">
                                              {subject ? `${subject.code} • ${subject.credits} Credits` : subjectCode}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-amber-600 italic bg-white rounded-lg p-3 border border-amber-200">
                                      No archived subjects
                                    </div>
                                  )}
                                </div>

                                {/* Enrolled Subjects (Active Status) */}
                                <div>
                                  <h5 className="text-sm font-bold text-emerald-900 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Enrolled Subjects (Active Status)
                                  </h5>
                                  {enrolledIn.length > 0 ? (
                                    <div className="space-y-2">
                                      {enrolledIn.map(subjectCode => {
                                        const subject = subjects.find(s => s.code === subjectCode)
                                        return (
                                          <div key={subjectCode} className="bg-white rounded-lg p-3 border border-emerald-200">
                                            <div className="text-sm font-semibold text-emerald-900">
                                              {subject ? subject.name : subjectCode}
                                            </div>
                                            <div className="text-xs text-emerald-600 mt-1">
                                              {subject ? `${subject.code} • ${subject.credits} Credits` : subjectCode}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-emerald-600 italic bg-white rounded-lg p-3 border border-emerald-200">
                                      Not currently enrolled in any subjects
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    {students.filter(student => {

                      const matchesSubjectFilter = selectedSubjectsForBulk.length === 0
                        ? (student.archivedSubjects || []).length > 0
                        : selectedSubjectsForBulk.some(subjectCode => 
                            (student.archivedSubjects || []).includes(subjectCode)
                          )
                      
                      if (!matchesSubjectFilter) return false
                      

                      if (studentSearchTerm.trim() === '') return true
                      
                      const searchLower = studentSearchTerm.toLowerCase().trim()
                      const nameMatch = student.name?.toLowerCase().includes(searchLower) || false
                      const idMatch = student.id?.toString().includes(searchLower) || false
                      
                      return nameMatch || idMatch
                    }).length === 0 && (
                      <div className="px-4 py-8 text-center text-amber-600">
                        {studentSearchTerm.trim() 
                          ? `No archived students found matching "${studentSearchTerm}" for the selected subjects.`
                          : 'No archived students found for the selected subjects.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className={`rounded-2xl border shadow-lg px-6 py-5 ${
                isDarkMode ? 'bg-[#1b1b1b] border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <p className="text-xs uppercase tracking-[0.2em] text-maroon-500">Basic Information</p>
                <h4 className={`mt-1 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Create New Student Profile
                </h4>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Enter the official student ID, full name, and institutional email. We'll automatically create the profile.
                </p>
                <div className="space-y-4 mt-2">
                  <div>
                    <label htmlFor="new-student-id" className="sr-only">Student ID</label>
                    <input
                      id="new-student-id"
                      name="new-student-id"
                      type="text"
                      value={newStudent.id}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        setNewStudent(prev => ({ ...prev, id: value }))
                      }}
                      placeholder="Student ID"
                      className={`form-input-field focus:ring-2 focus:ring-maroon-500 ${
                        isDarkMode ? 'bg-[#101010] border-slate-700 text-white placeholder:text-slate-500' : ''
                      }`}
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-student-name" className="sr-only">Student full name</label>
                    <input
                      id="new-student-name"
                      name="new-student-name"
                      type="text"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Student full name"
                      className={`form-input-field focus:ring-2 focus:ring-maroon-500 ${
                        isDarkMode ? 'bg-[#101010] border-slate-700 text-white placeholder:text-slate-500' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="new-student-email" className="sr-only">Institutional email</label>
                    <input
                      id="new-student-email"
                      name="new-student-email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Institutional email"
                      className={`form-input-field focus:ring-2 focus:ring-maroon-500 ${
                        isDarkMode ? 'bg-[#101010] border-slate-700 text-white placeholder:text-slate-500' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
              <div className={`rounded-2xl border shadow-lg px-6 py-5 ${
                isDarkMode ? 'bg-[#1b1b1b] border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <p className="text-xs uppercase tracking-[0.2em] text-maroon-500">Enrollment</p>
                <h4 className={`mt-1 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Assign Subjects
                </h4>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Select one or more subjects where this student should be enrolled immediately.
                </p>
                <div className="mt-3 relative" ref={newStudentSubjectDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowNewStudentSubjectDropdown(prev => !prev)}
                    className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                      isDarkMode ? 'border-slate-600 bg-[#0f0f0f]' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="pr-4">
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {newStudent.subjects?.length > 0
                          ? `${newStudent.subjects.length} subject${newStudent.subjects.length === 1 ? '' : 's'} selected`
                          : 'No subjects selected'}
                      </p>
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} truncate`}>
                        {newStudent.subjects?.length > 0
                          ? newStudent.subjects.map(getSubjectLabel).join(', ')
                          : 'Click to choose subjects'}
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${
                        showNewStudentSubjectDropdown ? 'rotate-180' : ''
                      } ${isDarkMode ? 'text-white' : 'text-maroon-600'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showNewStudentSubjectDropdown && (
                    <div
                      className={`absolute z-40 mt-2 w-full rounded-2xl border shadow-2xl ${

                        'bg-white border-slate-200'
                      }`}
                    >
                      <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {subjects.length === 0 ? (
                          <p className={`text-sm px-4 py-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            No subjects available. Create a subject first.
                          </p>
                        ) : (
                          subjects.map(subject => {
                            const checked = (newStudent.subjects || []).includes(subject.code)
                            return (
                              <label
                                key={subject.code}
                                className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-slate-50"
                                onMouseDown={e => e.preventDefault()}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleNewStudentSubjectSelection(subject.code)}
                                    className="form-checkbox h-4 w-4 text-maroon-600 rounded"
                                  />
                                  <span className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                                    {subject.code} — {subject.name}
                                  </span>
                                </div>
                                {checked && (
                                  <svg className="w-4 h-4 text-maroon-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </label>
                            )
                          })
                        )}
                      </div>
                      <div className={`flex items-center justify-between px-4 py-2 border-t ${
                        isDarkMode ? 'border-slate-700' : 'border-slate-100'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setNewStudent(prev => ({ ...prev, subjects: [] }))}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewStudentSubjectDropdown(false)}
                          className="text-sm font-semibold text-maroon-600 hover:text-maroon-800"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Only show for Archived and Create tabs, not Import tab */}
        {addStudentModalTab !== 'import' && (
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                onClose()
                setAddStudentModalTab('archived')
                setSelectedStudentsForBulk([])
                setSelectedSubjectsForBulk([])
                setSelectAllStudents(false)
                setArchivedStudentDetailView(null)
              }}
              className="px-6 py-3 text-slate-600 hover:text-slate-800 font-medium rounded-xl hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            {addStudentModalTab === 'archived' ? (
              <button
                onClick={async () => {
                  try {
                    if (selectedStudentsForBulk.length === 0) {
                      addCustomAlert('warning', 'No Selection', 'Please select at least one archived student.', false)
                      return
                    }
                    if (selectedSubjectsForBulk.length === 0) {
                      addCustomAlert('warning', 'No Subject Selected', 'Please select at least one subject to restore from.', false)
                      return
                    }

                    let restoredCount = 0
                    const studentsRestored = new Set()


                    for (const studentId of selectedStudentsForBulk) {
                      const student = findStudentById(students, studentId)
                      if (!student) continue

                      for (const subjectCode of selectedSubjectsForBulk) {
                        const wasArchived = (student.archivedSubjects || []).includes(subjectCode)
                        if (!wasArchived) continue

                        await handleRestoreStudent(studentId, subjectCode)
                        restoredCount++
                        studentsRestored.add(studentId)
                      }
                    }

                    if (restoredCount === 0) {
                      addCustomAlert('info', 'Nothing to Restore', 'Selected students are not archived in the selected subject(s).', false)
                      return
                    }

                    addCustomAlert(
                      'success',
                      'Students Restored',
                      `Successfully restored ${studentsRestored.size} student(s) from ${selectedSubjectsForBulk.length} subject(s).`,
                      false
                    )


                    onClose()
                    setSelectedStudentsForBulk([])
                    setSelectedSubjectsForBulk([])
                    setSelectAllStudents(false)
                  } catch (error) {
                    console.error('Error restoring students:', error)
                    addCustomAlert('error', 'Restore Failed', `Failed to restore students: ${error.message}`, false)
                  }
                }}
                className="btn text-white px-6 py-3 rounded-xl font-semibold shadowLg hover:shadow-xl transition-all duration-300"
              >
                Restore Selected Students
              </button>
            ) : (
              <button
                onClick={async () => {
                  await handleAddStudent()
                  onClose()
                  setAddStudentModalTab('enroll')
                  setNewStudent({ id: '', name: '', email: '', subjects: [] })
                }}
                className="btn text-white px-6 py-3 rounded-xl font-semibold shadowLg hover:shadow-xl transition-all duration-300"
              >
                Add Student
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddStudentModal

