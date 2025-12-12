import React from 'react'
import subjectIcon from '../subject-icon.png'
import { useTheme } from '../../../hooks/useTheme'

const SubjectsTab = ({
  subjects,
  enrolls,
  subjectsView,
  setSubjectsView,
  subjectSearchQuery,
  setSubjectSearchQuery,
  subjectFilterTerm,
  setSubjectFilterTerm,
  subjectSortBy,
  setSubjectSortBy,
  subjectSortOrder,
  setSubjectSortOrder,
  subjectPage,
  setSubjectPage,
  subjectItemsPerPage,
  archivedSubjectsSearchTerm,
  setArchivedSubjectsSearchTerm,
  selectedArchivedSubjects,
  setSelectedArchivedSubjects,
  selectAllArchivedSubjects,
  setSelectAllArchivedSubjects,
  selectedRecycleBinSubjects,
  setSelectedRecycleBinSubjects,
  selectAllRecycleBinSubjects,
  setSelectAllRecycleBinSubjects,
  removedSubjects,
  recycleBinSubjects,
  onSubjectClick,
  onAddSubject,
  onDeleteSubject,
  onUpdateSubjectTerm,
  onRefresh,
  onRestoreSubject,
  onMoveToRecycleBin,
  onPermanentlyDelete,
  onRestoreFromRecycleBin
}) => {
  const { isDarkMode } = useTheme()


  const getFilteredSubjects = () => {
    let filtered = subjects.filter(subject => {
      if (!subjectSearchQuery) return true
      const searchLower = subjectSearchQuery.toLowerCase()
      const name = (subject.name || '').toLowerCase()
      const code = (subject.code || '').toLowerCase()
      return name.includes(searchLower) || code.includes(searchLower)
    })
    

    if (subjectFilterTerm !== 'all') {
      filtered = filtered.filter(subject => {
        if (subjectFilterTerm === 'first') {
          return !subject.term || subject.term === 'first'
        }
        if (subjectFilterTerm === 'second') {
          return subject.term === 'second'
        }
        return true
      })
    }
    
    return filtered
  }


  const getSortedSubjects = (filtered) => {
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      let aValue, bValue
      switch (subjectSortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase()
          bValue = (b.name || '').toLowerCase()
          break
        case 'code':
          aValue = (a.code || '').toLowerCase()
          bValue = (b.code || '').toLowerCase()
          break
        case 'credits':
          aValue = parseInt(a.credits) || 0
          bValue = parseInt(b.credits) || 0
          break
        case 'enrollment':
          aValue = enrolls[a.code]?.length || 0
          bValue = enrolls[b.code]?.length || 0
          break
        default:
          aValue = (a.name || '').toLowerCase()
          bValue = (b.name || '').toLowerCase()
      }
      
      if (subjectSortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })
    return sorted
  }

  const filteredSubjects = getFilteredSubjects()
  const sortedSubjects = getSortedSubjects(filteredSubjects)
  

  const startIndex = (subjectPage - 1) * subjectItemsPerPage
  const endIndex = startIndex + subjectItemsPerPage
  const paginatedSubjects = sortedSubjects.slice(startIndex, endIndex)
  const totalSubjectPages = Math.ceil(sortedSubjects.length / subjectItemsPerPage)


  const filteredArchivedSubjects = removedSubjects.filter(subject => {
    if (!archivedSubjectsSearchTerm) return true
    const searchLower = archivedSubjectsSearchTerm.toLowerCase()
    const name = (subject.name || '').toLowerCase()
    const code = (subject.code || '').toLowerCase()
    return name.includes(searchLower) || code.includes(searchLower)
  })

  return (
    <div className={`glass rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 ${
      isDarkMode ? 'bg-[#1a1a1a]' : ''
    }`}>
      {/* Enhanced Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg border flex-shrink-0 ${
              isDarkMode 
                ? 'bg-transparent border-red-200/40' 
                : 'bg-transparent border-red-200'
            }`}>
              <img
                src={subjectIcon}
                alt="Subject icon"
                className="w-full h-full rounded-xl sm:rounded-2xl object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold break-words ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>Subject Management</h2>
              <p className={`text-xs sm:text-sm md:text-base mt-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {subjectsView === 'active'
                  ? 'Click on any subject to view enrolled students and manage enrollment.'
                  : subjectsView === 'archived'
                    ? 'Manage archived subjects. You can restore them or move them to Recycle Bin.'
                    : 'Manage subjects in Recycle Bin. You can restore them to Archived or permanently delete them.'}
              </p>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            className={`group relative overflow-hidden px-4 py-3.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 flex-1 sm:flex-initial min-h-[50px] sm:min-h-0 touch-manipulation ${
              isDarkMode
                ? 'bg-slate-700 text-white hover:bg-slate-600 border border-slate-600'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
            }`}
            title="Refresh data from server"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm sm:text-base font-medium">Refresh</span>
          </button>
          {subjectsView === 'active' && (
            <button
              onClick={onAddSubject}
              className={`group relative overflow-hidden px-4 py-3.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2 flex-1 sm:flex-initial min-h-[50px] sm:min-h-0 touch-manipulation ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#7A1315] to-[#b91c1c] hover:from-[#8a1518] hover:to-[#c91d1d]'
                  : 'bg-gradient-to-r from-[#7A1315] to-[#b91c1c] hover:from-[#8a1518] hover:to-[#c91d1d]'
              }`}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <svg className="w-5 h-5 relative z-10 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" />
              </svg>
              <span className="relative z-10 text-sm sm:text-base">Add Subject</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Enhanced Toggle Switch */}
      <div className="mb-6 sm:mb-8">
        <div className={`relative w-full sm:w-auto sm:inline-flex rounded-2xl p-1.5 shadow-lg toggle-switch-container ${
          isDarkMode 
            ? 'bg-slate-800/50 border-2 border-slate-700' 
            : 'bg-slate-50 border-2 border-slate-200'
        }`}>
          <div
            className={`absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-br from-[#7A1315] via-[#8a1518] to-[#b91c1c] transition-[left,right] duration-300 ease-out shadow-lg toggle-indicator sm:hidden ${
              subjectsView === 'active' 
                ? 'toggle-indicator-active' 
                : 'toggle-indicator-archived'
            }`}
            style={{
              boxShadow: '0 4px 12px rgba(122, 19, 21, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              zIndex: 1
            }}
          />
          <button
            type="button"
            onClick={() => setSubjectsView('active')}
            className={`relative z-20 flex-1 px-3 py-3 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-center transition-all duration-300 rounded-xl min-h-[48px] sm:min-h-0 touch-manipulation whitespace-nowrap ${
              subjectsView === 'active'
                ? 'text-white sm:bg-gradient-to-br sm:from-[#7A1315] sm:via-[#8a1518] sm:to-[#b91c1c] sm:shadow-lg'
                : isDarkMode
                  ? 'text-slate-300 hover:text-slate-200 sm:bg-transparent'
                  : 'text-slate-600 hover:text-slate-700 sm:bg-transparent'
            }`}
            style={{
              textShadow: subjectsView === 'active' ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
              backgroundColor: 'transparent'
            }}
          >
            <span className="block truncate">Active Subjects</span>
          </button>
          <button
            type="button"
            onClick={() => setSubjectsView('archived')}
            className={`relative z-20 flex-1 px-3 py-3 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold text-center transition-all duration-300 rounded-xl min-h-[48px] sm:min-h-0 touch-manipulation whitespace-nowrap ${
              subjectsView === 'archived'
                ? 'text-white sm:bg-gradient-to-br sm:from-[#7A1315] sm:via-[#8a1518] sm:to-[#b91c1c] sm:shadow-lg'
                : isDarkMode
                  ? 'text-slate-300 hover:text-slate-200 sm:bg-transparent'
                  : 'text-slate-600 hover:text-slate-700 sm:bg-transparent'
            }`}
            style={{
              textShadow: subjectsView === 'archived' ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
              backgroundColor: 'transparent'
            }}
          >
            <span className="block truncate">Archived Subjects</span>
          </button>
        </div>
      </div>

      {/* Render based on view */}
      {subjectsView === 'active' && (
        <>
          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
            <button
              onClick={() => {
                setSubjectFilterTerm('all')
                setSubjectPage(1)
              }}
              className={`px-5 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-lg text-sm font-semibold transition-all min-h-[44px] sm:min-h-0 touch-manipulation flex-1 sm:flex-initial ${
                subjectFilterTerm === 'all'
                  ? isDarkMode
                    ? 'bg-[#7A1315] text-white shadow-lg'
                    : 'bg-[#7A1315] text-white shadow-lg'
                  : isDarkMode
                    ? 'bg-[#2c2c2c] text-slate-300 border border-slate-600 hover:bg-[#3c3c3c] hover:border-slate-500'
                    : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setSubjectFilterTerm('first')
                setSubjectPage(1)
              }}
              className={`px-5 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-lg text-sm font-semibold transition-all min-h-[44px] sm:min-h-0 touch-manipulation flex-1 sm:flex-initial ${
                subjectFilterTerm === 'first'
                  ? isDarkMode
                    ? 'bg-[#7A1315] text-white shadow-lg'
                    : 'bg-[#7A1315] text-white shadow-lg'
                  : isDarkMode
                    ? 'bg-[#2c2c2c] text-slate-300 border border-slate-600 hover:bg-[#3c3c3c] hover:border-slate-500'
                    : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              1st Term
            </button>
            <button
              onClick={() => {
                setSubjectFilterTerm('second')
                setSubjectPage(1)
              }}
              className={`px-5 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-lg text-sm font-semibold transition-all min-h-[44px] sm:min-h-0 touch-manipulation flex-1 sm:flex-initial ${
                subjectFilterTerm === 'second'
                  ? isDarkMode
                    ? 'bg-[#7A1315] text-white shadow-lg'
                    : 'bg-[#7A1315] text-white shadow-lg'
                  : isDarkMode
                    ? 'bg-[#2c2c2c] text-slate-300 border border-slate-600 hover:bg-[#3c3c3c] hover:border-slate-500'
                    : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              2nd Term
            </button>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search subjects..."
                value={subjectSearchQuery}
                onChange={(e) => {
                  setSubjectSearchQuery(e.target.value)
                  setSubjectPage(1)
                }}
                className={`w-full px-4 py-2 pl-10 rounded-lg border text-sm ${
                  isDarkMode 
                    ? 'bg-[#2c2c2c] border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                } focus:outline-none focus:ring-2 focus:ring-[#7A1315] focus:border-transparent`}
              />
              <i className={`fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}></i>
            </div>
            
            <select
              value={`${subjectSortBy}-${subjectSortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-')
                setSubjectSortBy(newSortBy)
                setSubjectSortOrder(newSortOrder)
                setSubjectPage(1)
              }}
              className={`px-4 py-2 rounded-lg border text-sm ${
                isDarkMode 
                  ? 'bg-[#2c2c2c] border-slate-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-800'
              } focus:outline-none focus:ring-2 focus:ring-[#7A1315] focus:border-transparent`}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="code-asc">Code (A-Z)</option>
              <option value="code-desc">Code (Z-A)</option>
              <option value="credits-desc">Credits (High-Low)</option>
              <option value="credits-asc">Credits (Low-High)</option>
              <option value="enrollment-desc">Enrollment (High-Low)</option>
              <option value="enrollment-asc">Enrollment (Low-High)</option>
            </select>
          </div>
          
          {filteredSubjects.length > 0 && (
            <div className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Showing {paginatedSubjects.length} of {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''}
            </div>
          )}
          
          {/* Subject Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {paginatedSubjects.map((subject) => {
              const enrolledCount = enrolls[subject.code] ? enrolls[subject.code].length : 0
              return (
                <div
                  key={`active-${subject.code}`}
                  onClick={() => onSubjectClick(subject)}
                  className={`group relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-[#2c2c2c] to-[#1f1f1f] border border-slate-700 hover:border-slate-600'
                      : 'bg-gradient-to-br from-white to-slate-50 border border-slate-200 hover:border-[#7A1315]/30 shadow-xl'
                  }`}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${
                    isDarkMode
                      ? 'from-[#7A1315]/20 to-transparent'
                      : 'from-[#7A1315]/5 to-transparent'
                  }`}></div>
                  
                  <div className="relative z-10 flex flex-col space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                          isDarkMode
                            ? 'bg-gradient-to-br from-[#7A1315]/40 to-[#4a0c0d]/40 border border-[#7A1315]/30'
                            : 'bg-gradient-to-br from-red-100 to-red-50 border border-red-200'
                        }`}>
                          <svg className={`w-6 h-6 ${
                            isDarkMode ? 'text-red-400' : 'text-[#7A1315]'
                          }`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-lg font-bold truncate ${
                              isDarkMode ? 'text-white' : 'text-slate-800'
                            }`}>{subject.name}</h3>
                            <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => onUpdateSubjectTerm(subject.code, 'first', e)}
                                className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
                                  (!subject.term || subject.term === 'first')
                                    ? isDarkMode
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-blue-500 text-white shadow-sm'
                                    : isDarkMode
                                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                                title="Click to set as 1st Term"
                              >
                                1st
                              </button>
                              <button
                                onClick={(e) => onUpdateSubjectTerm(subject.code, 'second', e)}
                                className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-all ${
                                  subject.term === 'second'
                                    ? isDarkMode
                                      ? 'bg-purple-600 text-white shadow-sm'
                                      : 'bg-purple-500 text-white shadow-sm'
                                    : isDarkMode
                                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                                title="Click to set as 2nd Term"
                              >
                                2nd
                              </button>
                            </div>
                          </div>
                          <div className={`text-xs font-medium ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}>{subject.code} • {subject.credits} Credits</div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => onDeleteSubject(subject.code, e)}
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          isDarkMode
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                            : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span className="text-xs font-semibold">{enrolledCount} enrolled</span>
                      </div>
                      {subject.createdAt && (
                        <div className={`text-xs ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {(() => {
                            try {
                              const date = new Date(subject.createdAt)
                              return date.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })
                            } catch {
                              return new Date(subject.createdAt).toLocaleDateString()
                            }
                          })()}
                        </div>
                      )}
                    </div>
                    
                    <div className={`pt-2 border-t ${
                      isDarkMode ? 'border-slate-700' : 'border-slate-200'
                    }`}>
                      <div className={`flex items-center gap-2 text-xs ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="font-medium">Click to view enrolled students and manage</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {filteredSubjects.length === 0 && (
              <div className={`col-span-full text-center py-12 rounded-2xl ${
                isDarkMode 
                  ? 'bg-[#1a1a1a] border border-slate-700 text-slate-400' 
                  : 'bg-slate-50 border border-slate-200 text-slate-500'
              }`}>
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-lg font-semibold mb-2">
                  {subjectSearchQuery ? 'No subjects found matching your search.' : 'No subjects yet'}
                </p>
                {!subjectSearchQuery && (
                  <p className="text-sm">Click "Add Subject" to create your first subject</p>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalSubjectPages > 1 && (
            <div className={`flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-6 border-t ${
              isDarkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Page {subjectPage} of {totalSubjectPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSubjectPage(prev => Math.max(1, prev - 1))}
                  disabled={subjectPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    subjectPage === 1
                      ? isDarkMode
                        ? 'bg-[#2c2c2c] text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                      : isDarkMode
                        ? 'bg-[#2c2c2c] text-white border border-slate-600 hover:bg-[#3c3c3c]'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <i className="fa-solid fa-chevron-left mr-1"></i> Prev
                </button>
                <button
                  onClick={() => setSubjectPage(prev => Math.min(totalSubjectPages, prev + 1))}
                  disabled={subjectPage === totalSubjectPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    subjectPage === totalSubjectPages
                      ? isDarkMode
                        ? 'bg-[#2c2c2c] text-slate-600 cursor-not-allowed opacity-50'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                      : isDarkMode
                        ? 'bg-[#2c2c2c] text-white border border-slate-600 hover:bg-[#3c3c3c]'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Next <i className="fa-solid fa-chevron-right ml-1"></i>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Archived Subjects View - Simplified for now, can be expanded later */}
      {subjectsView === 'archived' && (
        <div className={`text-center py-12 rounded-2xl ${
          isDarkMode 
            ? 'bg-[#1a1a1a] border border-slate-700 text-slate-400' 
            : 'bg-slate-50 border border-slate-200 text-slate-500'
        }`}>
          <p className="text-lg font-semibold mb-2">
            Archived subjects management will be implemented here
          </p>
          <p className="text-sm">Found {removedSubjects.length} archived subject{removedSubjects.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Recycle Bin View - Simplified for now */}
      {subjectsView === 'recycle' && (
        <div className={`text-center py-12 rounded-2xl ${
          isDarkMode 
            ? 'bg-[#1a1a1a] border border-slate-700 text-slate-400' 
            : 'bg-slate-50 border border-slate-200 text-slate-500'
        }`}>
          <p className="text-lg font-semibold mb-2">
            Recycle bin management will be implemented here
          </p>
          <p className="text-sm">Found {recycleBinSubjects.length} subject{recycleBinSubjects.length !== 1 ? 's' : ''} in recycle bin</p>
        </div>
      )}
    </div>
  )
}

export default SubjectsTab

