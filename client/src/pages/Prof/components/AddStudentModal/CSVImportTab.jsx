import React from 'react'
import { useTheme } from '../../../../hooks/useTheme'

const CSVImportTab = ({
  studentSubjectFilter,
  setStudentSubjectFilter,
  subjects,
  csvFile,
  csvPreview,
  csvImportWarnings,
  isImporting,
  handleFileSelect,
  handleImportCSV,
  onClose
}) => {
  const { isDarkMode } = useTheme()

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
          const id = student.id || ''
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
          (studentSubjectFilter ? [] : []).map(id => id)
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
                onClick={() => {

                }}
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
                    const id = student.id || ''
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
                                <path d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z" />
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


            await handleImportCSV()
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
  )
}

export default CSVImportTab

