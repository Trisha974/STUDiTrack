import { useReducer } from 'react'

/**
 * Reducer for managing Prof.jsx UI and form states
 * Groups related state to reduce the number of useState hooks
 */


const initialState = {

  newSubject: { code: '', name: '', credits: '', term: 'first' },
  profileForm: { name: '', pic: null },
  newStudent: { id: '', name: '', email: '', subjects: [] },
  newStudentQuick: { id: '', name: '', email: '' },
  

  profileSaveSuccess: false,
  addSubjectError: '',
  isSavingSubject: false,
  alreadyEnrolledMessage: null,
  

  activeTab: 'subjects',
  showProfileDropdown: false,
  showSubjectDetail: false,
  showArchivedStudents: false,
  showStudentSearchDropdownAdd: false,
  showSearchDropdown: false,
  showRestoreSubjectDropdown: false,
  showNewStudentSubjectDropdown: false,
  

  selectedSubject: null,
  selectedSubjectForStudent: null,
  archivedStudentDetailView: null,
  

  subjectSearchQuery: '',
  subjectFilterTerm: 'all',
  subjectSortBy: 'name',
  subjectSortOrder: 'asc',
  subjectPage: 1,
  studentSubjectFilter: '',
  studentSearchTerm: '',
  studentSearchTermAdd: '',
  studentRecordSearchTerm: '',
  studentRecordFilter: 'all',
  

  addStudentModalTab: 'import',
  selectedStudentsForBulk: [],
  selectedSubjectsForBulk: [],
  selectAllStudents: false,
  selectedArchivedSubjects: [],
  selectAllArchivedSubjects: false,
  selectedRecycleBinSubjects: [],
  selectAllRecycleBinSubjects: false,
  studentToAdd: [],
}


const ACTION_TYPES = {

  UPDATE_NEW_SUBJECT: 'UPDATE_NEW_SUBJECT',
  UPDATE_PROFILE_FORM: 'UPDATE_PROFILE_FORM',
  UPDATE_NEW_STUDENT: 'UPDATE_NEW_STUDENT',
  UPDATE_NEW_STUDENT_QUICK: 'UPDATE_NEW_STUDENT_QUICK',
  RESET_NEW_SUBJECT: 'RESET_NEW_SUBJECT',
  RESET_NEW_STUDENT: 'RESET_NEW_STUDENT',
  

  SET_PROFILE_SAVE_SUCCESS: 'SET_PROFILE_SAVE_SUCCESS',
  SET_ADD_SUBJECT_ERROR: 'SET_ADD_SUBJECT_ERROR',
  SET_IS_SAVING_SUBJECT: 'SET_IS_SAVING_SUBJECT',
  SET_ALREADY_ENROLLED_MESSAGE: 'SET_ALREADY_ENROLLED_MESSAGE',
  

  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_SHOW_PROFILE_DROPDOWN: 'SET_SHOW_PROFILE_DROPDOWN',
  SET_SHOW_SUBJECT_DETAIL: 'SET_SHOW_SUBJECT_DETAIL',
  SET_SHOW_ARCHIVED_STUDENTS: 'SET_SHOW_ARCHIVED_STUDENTS',
  SET_SHOW_STUDENT_SEARCH_DROPDOWN_ADD: 'SET_SHOW_STUDENT_SEARCH_DROPDOWN_ADD',
  SET_SHOW_SEARCH_DROPDOWN: 'SET_SHOW_SEARCH_DROPDOWN',
  SET_SHOW_RESTORE_SUBJECT_DROPDOWN: 'SET_SHOW_RESTORE_SUBJECT_DROPDOWN',
  SET_SHOW_NEW_STUDENT_SUBJECT_DROPDOWN: 'SET_SHOW_NEW_STUDENT_SUBJECT_DROPDOWN',
  

  SET_SELECTED_SUBJECT: 'SET_SELECTED_SUBJECT',
  SET_SELECTED_SUBJECT_FOR_STUDENT: 'SET_SELECTED_SUBJECT_FOR_STUDENT',
  SET_ARCHIVED_STUDENT_DETAIL_VIEW: 'SET_ARCHIVED_STUDENT_DETAIL_VIEW',
  

  SET_SUBJECT_SEARCH_QUERY: 'SET_SUBJECT_SEARCH_QUERY',
  SET_SUBJECT_FILTER_TERM: 'SET_SUBJECT_FILTER_TERM',
  SET_SUBJECT_SORT_BY: 'SET_SUBJECT_SORT_BY',
  SET_SUBJECT_SORT_ORDER: 'SET_SUBJECT_SORT_ORDER',
  SET_SUBJECT_PAGE: 'SET_SUBJECT_PAGE',
  SET_STUDENT_SUBJECT_FILTER: 'SET_STUDENT_SUBJECT_FILTER',
  SET_STUDENT_SEARCH_TERM: 'SET_STUDENT_SEARCH_TERM',
  SET_STUDENT_SEARCH_TERM_ADD: 'SET_STUDENT_SEARCH_TERM_ADD',
  SET_STUDENT_RECORD_SEARCH_TERM: 'SET_STUDENT_RECORD_SEARCH_TERM',
  SET_STUDENT_RECORD_FILTER: 'SET_STUDENT_RECORD_FILTER',
  

  SET_ADD_STUDENT_MODAL_TAB: 'SET_ADD_STUDENT_MODAL_TAB',
  SET_SELECTED_STUDENTS_FOR_BULK: 'SET_SELECTED_STUDENTS_FOR_BULK',
  SET_SELECTED_SUBJECTS_FOR_BULK: 'SET_SELECTED_SUBJECTS_FOR_BULK',
  SET_SELECT_ALL_STUDENTS: 'SET_SELECT_ALL_STUDENTS',
  SET_SELECTED_ARCHIVED_SUBJECTS: 'SET_SELECTED_ARCHIVED_SUBJECTS',
  SET_SELECT_ALL_ARCHIVED_SUBJECTS: 'SET_SELECT_ALL_ARCHIVED_SUBJECTS',
  SET_SELECTED_RECYCLE_BIN_SUBJECTS: 'SET_SELECTED_RECYCLE_BIN_SUBJECTS',
  SET_SELECT_ALL_RECYCLE_BIN_SUBJECTS: 'SET_SELECT_ALL_RECYCLE_BIN_SUBJECTS',
  SET_STUDENT_TO_ADD: 'SET_STUDENT_TO_ADD',
}


function uiStateReducer(state, action) {
  switch (action.type) {

    case ACTION_TYPES.UPDATE_NEW_SUBJECT:
      return { ...state, newSubject: { ...state.newSubject, ...action.payload } }
    case ACTION_TYPES.UPDATE_PROFILE_FORM:
      return { ...state, profileForm: { ...state.profileForm, ...action.payload } }
    case ACTION_TYPES.UPDATE_NEW_STUDENT:
      return { ...state, newStudent: { ...state.newStudent, ...action.payload } }
    case ACTION_TYPES.UPDATE_NEW_STUDENT_QUICK:
      return { ...state, newStudentQuick: { ...state.newStudentQuick, ...action.payload } }
    case ACTION_TYPES.RESET_NEW_SUBJECT:
      return { ...state, newSubject: { code: '', name: '', credits: '', term: 'first' } }
    case ACTION_TYPES.RESET_NEW_STUDENT:
      return { ...state, newStudent: { id: '', name: '', email: '', subjects: [] } }
    

    case ACTION_TYPES.SET_PROFILE_SAVE_SUCCESS:
      return { ...state, profileSaveSuccess: action.payload }
    case ACTION_TYPES.SET_ADD_SUBJECT_ERROR:
      return { ...state, addSubjectError: action.payload }
    case ACTION_TYPES.SET_IS_SAVING_SUBJECT:
      return { ...state, isSavingSubject: action.payload }
    case ACTION_TYPES.SET_ALREADY_ENROLLED_MESSAGE:
      return { ...state, alreadyEnrolledMessage: action.payload }
    

    case ACTION_TYPES.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload }
    case ACTION_TYPES.SET_SHOW_PROFILE_DROPDOWN:
      return { ...state, showProfileDropdown: action.payload }
    case ACTION_TYPES.SET_SHOW_SUBJECT_DETAIL:
      return { ...state, showSubjectDetail: action.payload }
    case ACTION_TYPES.SET_SHOW_ARCHIVED_STUDENTS:
      return { ...state, showArchivedStudents: action.payload }
    case ACTION_TYPES.SET_SHOW_STUDENT_SEARCH_DROPDOWN_ADD:
      return { ...state, showStudentSearchDropdownAdd: action.payload }
    case ACTION_TYPES.SET_SHOW_SEARCH_DROPDOWN:
      return { ...state, showSearchDropdown: action.payload }
    case ACTION_TYPES.SET_SHOW_RESTORE_SUBJECT_DROPDOWN:
      return { ...state, showRestoreSubjectDropdown: action.payload }
    case ACTION_TYPES.SET_SHOW_NEW_STUDENT_SUBJECT_DROPDOWN:
      return { ...state, showNewStudentSubjectDropdown: action.payload }
    

    case ACTION_TYPES.SET_SELECTED_SUBJECT:
      return { ...state, selectedSubject: action.payload }
    case ACTION_TYPES.SET_SELECTED_SUBJECT_FOR_STUDENT:
      return { ...state, selectedSubjectForStudent: action.payload }
    case ACTION_TYPES.SET_ARCHIVED_STUDENT_DETAIL_VIEW:
      return { ...state, archivedStudentDetailView: action.payload }
    

    case ACTION_TYPES.SET_SUBJECT_SEARCH_QUERY:
      return { ...state, subjectSearchQuery: action.payload }
    case ACTION_TYPES.SET_SUBJECT_FILTER_TERM:
      return { ...state, subjectFilterTerm: action.payload }
    case ACTION_TYPES.SET_SUBJECT_SORT_BY:
      return { ...state, subjectSortBy: action.payload }
    case ACTION_TYPES.SET_SUBJECT_SORT_ORDER:
      return { ...state, subjectSortOrder: action.payload }
    case ACTION_TYPES.SET_SUBJECT_PAGE:
      return { ...state, subjectPage: action.payload }
    case ACTION_TYPES.SET_STUDENT_SUBJECT_FILTER:
      return { ...state, studentSubjectFilter: action.payload }
    case ACTION_TYPES.SET_STUDENT_SEARCH_TERM:
      return { ...state, studentSearchTerm: action.payload }
    case ACTION_TYPES.SET_STUDENT_SEARCH_TERM_ADD:
      return { ...state, studentSearchTermAdd: action.payload }
    case ACTION_TYPES.SET_STUDENT_RECORD_SEARCH_TERM:
      return { ...state, studentRecordSearchTerm: action.payload }
    case ACTION_TYPES.SET_STUDENT_RECORD_FILTER:
      return { ...state, studentRecordFilter: action.payload }
    

    case ACTION_TYPES.SET_ADD_STUDENT_MODAL_TAB:
      return { ...state, addStudentModalTab: action.payload }
    case ACTION_TYPES.SET_SELECTED_STUDENTS_FOR_BULK:
      return { ...state, selectedStudentsForBulk: action.payload }
    case ACTION_TYPES.SET_SELECTED_SUBJECTS_FOR_BULK:
      return { ...state, selectedSubjectsForBulk: action.payload }
    case ACTION_TYPES.SET_SELECT_ALL_STUDENTS:
      return { ...state, selectAllStudents: action.payload }
    case ACTION_TYPES.SET_SELECTED_ARCHIVED_SUBJECTS:
      return { ...state, selectedArchivedSubjects: action.payload }
    case ACTION_TYPES.SET_SELECT_ALL_ARCHIVED_SUBJECTS:
      return { ...state, selectAllArchivedSubjects: action.payload }
    case ACTION_TYPES.SET_SELECTED_RECYCLE_BIN_SUBJECTS:
      return { ...state, selectedRecycleBinSubjects: action.payload }
    case ACTION_TYPES.SET_SELECT_ALL_RECYCLE_BIN_SUBJECTS:
      return { ...state, selectAllRecycleBinSubjects: action.payload }
    case ACTION_TYPES.SET_STUDENT_TO_ADD:
      return { ...state, studentToAdd: action.payload }
    
    default:
      return state
  }
}

/**
 * Custom hook for managing Prof.jsx UI and form states
 * @returns {[Object, Function]} [state, dispatch]
 */
export function useProfUIState() {
  const [state, dispatch] = useReducer(uiStateReducer, initialState)


  const actions = {

    updateNewSubject: (updates) => dispatch({ type: ACTION_TYPES.UPDATE_NEW_SUBJECT, payload: updates }),
    updateProfileForm: (updates) => dispatch({ type: ACTION_TYPES.UPDATE_PROFILE_FORM, payload: updates }),
    updateNewStudent: (updates) => dispatch({ type: ACTION_TYPES.UPDATE_NEW_STUDENT, payload: updates }),
    updateNewStudentQuick: (updates) => dispatch({ type: ACTION_TYPES.UPDATE_NEW_STUDENT_QUICK, payload: updates }),
    resetNewSubject: () => dispatch({ type: ACTION_TYPES.RESET_NEW_SUBJECT }),
    resetNewStudent: () => dispatch({ type: ACTION_TYPES.RESET_NEW_STUDENT }),
    

    setProfileSaveSuccess: (value) => dispatch({ type: ACTION_TYPES.SET_PROFILE_SAVE_SUCCESS, payload: value }),
    setAddSubjectError: (error) => dispatch({ type: ACTION_TYPES.SET_ADD_SUBJECT_ERROR, payload: error }),
    setIsSavingSubject: (value) => dispatch({ type: ACTION_TYPES.SET_IS_SAVING_SUBJECT, payload: value }),
    setAlreadyEnrolledMessage: (message) => dispatch({ type: ACTION_TYPES.SET_ALREADY_ENROLLED_MESSAGE, payload: message }),
    

    setActiveTab: (tab) => dispatch({ type: ACTION_TYPES.SET_ACTIVE_TAB, payload: tab }),
    setShowProfileDropdown: (show) => dispatch({ type: ACTION_TYPES.SET_SHOW_PROFILE_DROPDOWN, payload: show }),
    setShowSubjectDetail: (show) => dispatch({ type: ACTION_TYPES.SET_SHOW_SUBJECT_DETAIL, payload: show }),
    setShowArchivedStudents: (show) => dispatch({ type: ACTION_TYPES.SET_SHOW_ARCHIVED_STUDENTS, payload: show }),
    setShowStudentSearchDropdownAdd: (show) => dispatch({ type: ACTION_TYPES.SET_SHOW_STUDENT_SEARCH_DROPDOWN_ADD, payload: show }),
    setShowSearchDropdown: (show) => dispatch({ type: ACTION_TYPES.SET_SHOW_SEARCH_DROPDOWN, payload: show }),
    setShowRestoreSubjectDropdown: (show) => dispatch({ type: ACTION_TYPES.SET_SHOW_RESTORE_SUBJECT_DROPDOWN, payload: show }),
    setShowNewStudentSubjectDropdown: (show) => dispatch({ type: ACTION_TYPES.SET_SHOW_NEW_STUDENT_SUBJECT_DROPDOWN, payload: show }),
    

    setSelectedSubject: (subject) => dispatch({ type: ACTION_TYPES.SET_SELECTED_SUBJECT, payload: subject }),
    setSelectedSubjectForStudent: (subject) => dispatch({ type: ACTION_TYPES.SET_SELECTED_SUBJECT_FOR_STUDENT, payload: subject }),
    setArchivedStudentDetailView: (studentId) => dispatch({ type: ACTION_TYPES.SET_ARCHIVED_STUDENT_DETAIL_VIEW, payload: studentId }),
    

    setSubjectSearchQuery: (query) => dispatch({ type: ACTION_TYPES.SET_SUBJECT_SEARCH_QUERY, payload: query }),
    setSubjectFilterTerm: (term) => dispatch({ type: ACTION_TYPES.SET_SUBJECT_FILTER_TERM, payload: term }),
    setSubjectSortBy: (sortBy) => dispatch({ type: ACTION_TYPES.SET_SUBJECT_SORT_BY, payload: sortBy }),
    setSubjectSortOrder: (order) => dispatch({ type: ACTION_TYPES.SET_SUBJECT_SORT_ORDER, payload: order }),
    setSubjectPage: (page) => dispatch({ type: ACTION_TYPES.SET_SUBJECT_PAGE, payload: page }),
    setStudentSubjectFilter: (filter) => dispatch({ type: ACTION_TYPES.SET_STUDENT_SUBJECT_FILTER, payload: filter }),
    setStudentSearchTerm: (term) => dispatch({ type: ACTION_TYPES.SET_STUDENT_SEARCH_TERM, payload: term }),
    setStudentSearchTermAdd: (term) => dispatch({ type: ACTION_TYPES.SET_STUDENT_SEARCH_TERM_ADD, payload: term }),
    setStudentRecordSearchTerm: (term) => dispatch({ type: ACTION_TYPES.SET_STUDENT_RECORD_SEARCH_TERM, payload: term }),
    setStudentRecordFilter: (filter) => dispatch({ type: ACTION_TYPES.SET_STUDENT_RECORD_FILTER, payload: filter }),
    

    setAddStudentModalTab: (tab) => dispatch({ type: ACTION_TYPES.SET_ADD_STUDENT_MODAL_TAB, payload: tab }),
    setSelectedStudentsForBulk: (students) => dispatch({ type: ACTION_TYPES.SET_SELECTED_STUDENTS_FOR_BULK, payload: students }),
    setSelectedSubjectsForBulk: (subjects) => dispatch({ type: ACTION_TYPES.SET_SELECTED_SUBJECTS_FOR_BULK, payload: subjects }),
    setSelectAllStudents: (value) => dispatch({ type: ACTION_TYPES.SET_SELECT_ALL_STUDENTS, payload: value }),
    setSelectedArchivedSubjects: (subjects) => dispatch({ type: ACTION_TYPES.SET_SELECTED_ARCHIVED_SUBJECTS, payload: subjects }),
    setSelectAllArchivedSubjects: (value) => dispatch({ type: ACTION_TYPES.SET_SELECT_ALL_ARCHIVED_SUBJECTS, payload: value }),
    setSelectedRecycleBinSubjects: (subjects) => dispatch({ type: ACTION_TYPES.SET_SELECTED_RECYCLE_BIN_SUBJECTS, payload: subjects }),
    setSelectAllRecycleBinSubjects: (value) => dispatch({ type: ACTION_TYPES.SET_SELECT_ALL_RECYCLE_BIN_SUBJECTS, payload: value }),
    setStudentToAdd: (students) => dispatch({ type: ACTION_TYPES.SET_STUDENT_TO_ADD, payload: students }),
  }

  return [state, actions, dispatch]
}

