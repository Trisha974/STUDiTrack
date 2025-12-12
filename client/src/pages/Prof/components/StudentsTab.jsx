import React from 'react'
import { useTheme } from '../../../hooks/useTheme'
import { normalizeStudentId } from '../../../utils/validationHelpers'
import { findStudentById } from '../../../utils/studentHelpers'
import subjectIcon from '../subject-icon.png'

const StudentsTab = ({
  subjects,
  enrolls,
  students,
  studentsById,
  refreshTrigger,
  studentSearchTerm,
  setStudentSearchTerm,
  studentSubjectFilter,
  setStudentSubjectFilter,
  archivingStudentIds,
  onAddStudent,
  onAddStudentToSubject,
  onArchiveStudent,
  addCustomAlert
}) => {
  const { isDarkMode } = useTheme()

  return (
    <div className="glass rounded-2xl shadow-xl p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>Student Management</h2>
          <p className={`mt-1 ${
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>Manage student profiles and information</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-maroon-500 focus:outline-none ${
                isDarkMode 
                  ? 'bg-[#1a1a1a] text-white border-slate-600 placeholder-slate-400' 
                  : 'bg-white text-slate-800 border-slate-300 placeholder-slate-400'
              }`}
            />
            <svg className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-slate-400' : 'text-slate-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {/* Subject Filter */}
          <label htmlFor="student-subject-filter" className="sr-only">Filter by Subject</label>
          <select
            id="student-subject-filter"
            name="student-subject-filter"
            value={studentSubjectFilter}
            onChange={(e) => setStudentSubjectFilter(e.target.value)}
            className={`subject-filter-select focus:ring-2 focus:ring-maroon-500 px-4 py-2.5 rounded-xl ${
              isDarkMode 
                ? 'bg-[#1a1a1a] text-white border-slate-600' 
                : 'bg-white text-slate-800 border-slate-300'
            }`}
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.code} value={subject.code}>
                {subject.code} — {subject.name}
              </option>
            ))}
          </select>
          <button
            onClick={onAddStudent}
            className="btn text-white px-6 py-2.5 rounded-xl font-semibold shadowLg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Student</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {subjects
          .filter(subject => !studentSubjectFilter || subject.code === studentSubjectFilter)
          .map(subject => {
            const rawEnrollments = enrolls[subject.code] || []
            const normalizedEnrollments = rawEnrollments.map(normalizeStudentId).filter(Boolean)
            

            const currentStudentObjects = normalizedEnrollments
              .map(id => {
                let student = findStudentById(students, id)
                if (!student) {
                  student = studentsById[id]
                }
                if (!student) {
                  console.error(`❌ CRITICAL: Student ID ${id} is enrolled in ${subject.code} but not found in students array`, {
                    enrollmentId: id,
                    subjectCode: subject.code,
                    totalStudents: students.length,
                    studentIds: students.map(s => normalizeStudentId(s.id)),
                    enrollments: normalizedEnrollments,
                    studentsByIdKeys: Object.keys(studentsById),
                    studentsArray: students.map(s => ({ id: normalizeStudentId(s.id), name: s.name }))
                  })
                  return null
                }
                return student
              })
              .filter(Boolean)
              .filter(student => {
                const isArchived = (student.archivedSubjects || []).includes(subject.code)
                if (isArchived) {
                  console.log(`📦 Student ${student.name} (${student.id}) is archived from ${subject.code}`)
                }
                return !isArchived
              })
            
            const studentObjectsToShow = currentStudentObjects
            
            return (
              <div 
                key={`${subject.code}-${studentObjectsToShow.length}-${studentObjectsToShow.map(s => s.id).join(',')}-${refreshTrigger}`} 
                className="glass card shadowLg p-6 rounded-2xl flex flex-col space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{subject.name}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      {subject.code} • {subject.credits} Credits
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center border bg-transparent border-red-200">
                      <img
                        src={subjectIcon}
                        alt="Subject icon"
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-slate-700">
                      Current Students ({studentObjectsToShow
                        .filter(student => {
                          if (studentSearchTerm.trim() === '') return true
                          const searchLower = studentSearchTerm.toLowerCase().trim()
                          const nameMatch = student.name?.toLowerCase().includes(searchLower) || false
                          const idMatch = student.id?.toString().includes(searchLower) || false
                          return nameMatch || idMatch
                        })
                        .length}{studentSearchTerm.trim() !== '' && studentObjectsToShow.length > 0 ? ` of ${studentObjectsToShow.length}` : ''})
                    </h4>
                    <button
                      onClick={() => onAddStudentToSubject(subject.code)}
                      className="text-sm text-green-600 hover:text-green-800 font-semibold"
                    >
                      Add Student
                    </button>
                  </div>
                  {/* Make student list scrollable inside the card when there are many students */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {studentObjectsToShow
                      .filter(student => {
                        if (studentSearchTerm.trim() === '') return true
                        const searchLower = studentSearchTerm.toLowerCase().trim()
                        const nameMatch = student.name?.toLowerCase().includes(searchLower) || false
                        const idMatch = student.id?.toString().includes(searchLower) || false
                        return nameMatch || idMatch
                      })
                      .length > 0 ? (
                        studentObjectsToShow
                          .filter(student => {
                            if (studentSearchTerm.trim() === '') return true
                            const searchLower = studentSearchTerm.toLowerCase().trim()
                            const nameMatch = student.name?.toLowerCase().includes(searchLower) || false
                            const idMatch = student.id?.toString().includes(searchLower) || false
                            return nameMatch || idMatch
                          })
                          .map(student => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between bg-slate-50 p-3 rounded-lg"
                            >
                              <div>
                                <span className="text-sm text-slate-700">
                                  {student.name}
                                </span>
                                <div className="text-xs text-slate-500">
                                  ID: {student.id}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <button
                                  onClick={() => onArchiveStudent(student.id, subject.code)}
                                  disabled={!!archivingStudentIds[`${subject.code}-${normalizeStudentId(student.id)}`]}
                                  className={`text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded bg-white/80 border border-slate-200 transition ${
                                    archivingStudentIds[`${subject.code}-${normalizeStudentId(student.id)}`]
                                      ? 'opacity-50 cursor-not-allowed'
                                      : ''
                                  }`}
                                  title="Archive Student"
                                >
                                  {archivingStudentIds[`${subject.code}-${normalizeStudentId(student.id)}`] ? 'Archiving…' : '✕'}
                                </button>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-sm text-slate-500 p-3 bg-slate-50 rounded-lg text-center">
                          {studentSearchTerm.trim() !== '' 
                            ? `No students found matching "${studentSearchTerm}"`
                            : 'No enrolled students.'}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )
          })}
        {subjects.filter(subject => !studentSubjectFilter || subject.code === studentSubjectFilter).length === 0 && (
          <div className="col-span-3 text-center text-slate-500 py-8">
            No subjects found.
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentsTab

