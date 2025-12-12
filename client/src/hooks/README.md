# Custom Hooks

This directory contains custom React hooks for managing application state and data.

## Available Hooks

### useSubjects
Manages subject/course data and operations.

```jsx
import { useSubjects } from '../hooks/useSubjects'

const {
  subjects,
  isLoading,
  error,
  loadSubjects,
  addSubject,
  updateSubject,
  archiveSubject,
  deleteSubject,
  restoreSubject
} = useSubjects(profUid, saveData)
```

### useStudents
Manages student data and operations.

```jsx
import { useStudents } from '../hooks/useStudents'

const {
  students,
  studentsById,
  addStudent,
  updateStudent,
  deleteStudent,
  archiveStudent,
  unarchiveStudent,
  getStudentById
} = useStudents(saveData)
```

### useEnrollments
Manages enrollment data and operations.

```jsx
import { useEnrollments } from '../hooks/useEnrollments'

const {
  enrolls,
  loadEnrollments,
  addEnrollment,
  removeEnrollment,
  getEnrolledStudents
} = useEnrollments(profUid, saveData)
```

### useGrades
Manages grade data and operations.

```jsx
import { useGrades } from '../hooks/useGrades'

const {
  grades,
  addGrade,
  getGradesForSubject
} = useGrades(saveData)
```

### useAttendance
Manages attendance data and operations.

```jsx
import { useAttendance } from '../hooks/useAttendance'

const {
  records,
  markAttendance,
  getAttendanceForDate
} = useAttendance(saveData)
```

### useProfessorData
Manages data loading and saving.

```jsx
import { useProfessorData } from '../hooks/useProfessorData'

const {
  isLoading,
  error,
  loadData,
  saveData
} = useProfessorData(profUid)
```

## Usage Example

```jsx
import { useSubjects } from '../hooks/useSubjects'
import { useStudents } from '../hooks/useStudents'
import { useProfessorData } from '../hooks/useProfessorData'

function ProfComponent() {
  const [profUid, setProfUid] = useState(null)
  
  // Data management hook
  const { loadData, saveData } = useProfessorData(profUid)
  
  // Domain-specific hooks
  const subjectsHook = useSubjects(profUid, saveData)
  const studentsHook = useStudents(saveData)
  
  // Load initial data
  useEffect(() => {
    if (profUid) {
      loadData(profUid).then(data => {
        if (data) {
          subjectsHook.setSubjects(data.subjects || [])
          studentsHook.setStudents(data.students || [])
        }
      })
    }
  }, [profUid])
  
  // Use hooks in component
  return (
    <div>
      <button onClick={() => subjectsHook.addSubject({ code: 'CS101', name: 'Intro to CS' })}>
        Add Subject
      </button>
      {/* ... */}
    </div>
  )
}
```

## Benefits

- **Separation of Concerns**: Data logic separated from UI
- **Reusability**: Hooks can be used across multiple components
- **Testability**: Hooks can be tested independently
- **Maintainability**: Easier to understand and modify
- **Type Safety**: Clear interfaces for data operations

