/**
 * Application-wide constants
 * Centralizes magic strings, enums, and configuration values
 */


export const USER_ROLES = {
  PROFESSOR: 'professor',
  STUDENT: 'student',
  ADMIN: 'admin'
}

export const USER_TYPES = {
  PROFESSOR: 'Professor',
  STUDENT: 'Student'
}


export const PASSWORD_CONFIG = {
  MIN_LENGTH: 6,
  STRENGTH_MIN_LENGTH: 8
}


export const EMAIL_PATTERNS = {
  STUDENT: /^[a-z]+(\.[a-z]+)+\.\d+\.tc@umindanao\.edu\.ph$/i,
  PROFESSOR: /^[a-z0-9]+@umindanao\.edu\.ph$/i
}


export const DEPARTMENTS = [
  'Department of Computing Education',
  'Department of Engineering Education'
]

export const DASHBOARD_COLLECTION = 'professorDashboards'
export const STUDENT_DASHBOARD_COLLECTION = 'studentDashboards'


export const ASSESSMENT_TYPES = {
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  MIDTERM: 'midterm',
  FINAL: 'final',
  PROJECT: 'project',
  LAB: 'lab',
  PRESENTATION: 'presentation',
  PARTICIPATION: 'participation',
  EXAM: 'exam',
  OTHER: 'other'
}


export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
}


export const TERMS = {
  FIRST: 'first',
  SECOND: 'second'
}


export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  MAX_CSV_SIZE: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_CSV_TYPES: ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
}


export const VALIDATION_RULES = {
  STUDENT_ID: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 9,
    PATTERN: /^\d{6,9}$/
  },
  STUDENT_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s\-']+$/
  },
  SUBJECT_CODE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z0-9\-_]+$/
  },
  SUBJECT_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100
  },
  EMAIL: {
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  GRADE: {
    MIN_VALUE: 0,
    MAX_POINTS: 1000
  },
  CREDITS: {
    MIN_VALUE: 1,
    MAX_VALUE: 10
  }
}


export const UI_CONSTANTS = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  PAGINATION_SIZE: 20,
  MAX_NOTIFICATION_COUNT: 50,
  MODAL_Z_INDEX: 50
}


export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested item was not found.',
  DUPLICATE_ENTRY: 'This item already exists.',
  INVALID_FILE_TYPE: 'Invalid file type. Please choose a supported file.',
  FILE_TOO_LARGE: 'File is too large. Please choose a smaller file.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_FORMAT: 'Invalid format. Please check your input.'
}


export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully.',
  DELETED: 'Item deleted successfully.',
  CREATED: 'Item created successfully.',
  UPDATED: 'Item updated successfully.',
  UPLOADED: 'File uploaded successfully.',
  SENT: 'Message sent successfully.'
}


export const API_ENDPOINTS = {
  STUDENTS: '/api/students',
  PROFESSORS: '/api/professors',
  SUBJECTS: '/api/subjects',
  ENROLLMENTS: '/api/enrollments',
  GRADES: '/api/grades',
  ATTENDANCE: '/api/attendance',
  DASHBOARD: '/api/dashboard',
  NOTIFICATIONS: '/api/notifications'
}


export const COLLECTIONS = {
  DASHBOARD: 'professor_dashboards',
  STUDENTS: 'students',
  PROFESSORS: 'professors',
  SUBJECTS: 'subjects',
  ENROLLMENTS: 'enrollments',
  GRADES: 'grades',
  ATTENDANCE: 'attendance',
  NOTIFICATIONS: 'notifications'
}


export const STORAGE_KEYS = {
  THEME: 'theme',
  DISABLE_REALTIME: 'disableRealtimeUpdates',
  LAST_QUOTA_ERROR: 'lastQuotaError',
  COURSES_ENSURED: 'coursesEnsured',
  CURRENT_USER: 'currentUser',
  REMEMBER_ME: 'react_rememberMe',
  PROFILE_PROCESSING: 'studentProfileProcessing'
}


export const DEFAULT_PAGINATION = {
  ITEMS_PER_PAGE: 12,
  EXAM_ITEMS_PER_PAGE: 5
}


export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000
}


export const NOTIFICATION_TYPES = {
  GRADE: 'grade',
  ATTENDANCE: 'attendance',
  ENROLLMENT: 'enrollment',
  CONTENT: 'content',
  DISCUSSION: 'discussion',
  ADMINISTRATIVE: 'administrative',
  GENERAL: 'general'
}


export const MODAL_TYPES = {
  PROFILE: 'profile',
  ADD_SUBJECT: 'addSubject',
  NOTIFICATIONS: 'notifications',
  LOGOUT: 'logout',
  ADD_STUDENT: 'addStudent',
  ADD_STUDENT_TO_SUBJECT: 'addStudentToSubject',
  DELETE_SUBJECT: 'deleteSubject',
  EDIT_SUBJECT: 'editSubject',
  GRADE_STUDENT: 'gradeStudent',
  VIEW_ATTENDANCE: 'viewAttendance'
}


export const TAB_NAMES = {
  SUBJECTS: 'subjects',
  STUDENTS: 'students',
  GRADES: 'grades',
  ATTENDANCE: 'attendance',
  PROFILE: 'profile',
  SETTINGS: 'settings'
}


export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
}


export const FILTER_OPTIONS = {
  ALL: 'all',
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  PRESENT: 'present',
  ABSENT: 'absent'
}


export const TIMEOUTS = {
  SAVE_DEBOUNCE: 10000,
  API_REQUEST: 30000,
  NOTIFICATION_AUTO_HIDE: 3000,
  AUTH_TIMEOUT: 5000,
  POLL_INTERVAL: 5000,
  LOAD_CHECK: 3000,
  IMPORT_CHECK: 5000
}


export const ROLE_LEVELS = {
  STUDENT: 1,
  PROFESSOR: 2,
  ADMIN: 3,
  DEFAULT: 999
}


export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}


export const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}
