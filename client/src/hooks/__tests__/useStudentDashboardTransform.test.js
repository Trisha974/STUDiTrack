/**
 * Basic unit tests for useStudentDashboardTransform hook
 * Tests data transformation functions
 */

import { renderHook } from '@testing-library/react'
import { useStudentDashboardTransform } from '../useStudentDashboardTransform'

describe('useStudentDashboardTransform', () => {
  it('should provide transformDashboardDataFromMySQL function', () => {
    const { result } = renderHook(() => useStudentDashboardTransform())

    expect(result.current.transformDashboardDataFromMySQL).toBeDefined()
    expect(typeof result.current.transformDashboardDataFromMySQL).toBe('function')
  })

  it('should transform empty data correctly', () => {
    const { result } = renderHook(() => useStudentDashboardTransform())
    const { transformDashboardDataFromMySQL } = result.current

    const transformed = transformDashboardDataFromMySQL(
      [],
      [],
      [],
      [],
      'Test Student',
      []
    )

    expect(transformed).toEqual({
      id: 'student',
      name: 'Test Student',
      abs: 0,
      examTaken: 0,
      examTotal: 0,
      attRate: 0,
      avgGrade: 0,
      firstTerm: [],
      secondTerm: [],
      notifs: []
    })
  })

  it('should transform enrollment data with courses', () => {
    const { result } = renderHook(() => useStudentDashboardTransform())
    const { transformDashboardDataFromMySQL } = result.current

    const enrollmentsData = [
      {
        id: 1,
        course_id: 1,
        code: 'CS101',
        course_name: 'Computer Science',
        credits: 3,
        term: 'first',
        professor_name: 'Dr. Smith'
      }
    ]

    const transformed = transformDashboardDataFromMySQL(
      enrollmentsData,
      [],
      [],
      [],
      'Test Student',
      []
    )

    expect(transformed.firstTerm).toHaveLength(1)
    expect(transformed.firstTerm[0].code).toBe('CS101')
    expect(transformed.firstTerm[0].name).toBe('Computer Science')
  })

  it('should separate subjects by term', () => {
    const { result } = renderHook(() => useStudentDashboardTransform())
    const { transformDashboardDataFromMySQL } = result.current

    const enrollmentsData = [
      {
        id: 1,
        course_id: 1,
        code: 'CS101',
        course_name: 'Computer Science',
        credits: 3,
        term: 'first'
      },
      {
        id: 2,
        course_id: 2,
        code: 'MATH101',
        course_name: 'Mathematics',
        credits: 3,
        term: 'second'
      }
    ]

    const transformed = transformDashboardDataFromMySQL(
      enrollmentsData,
      [],
      [],
      [],
      'Test Student',
      []
    )

    expect(transformed.firstTerm).toHaveLength(1)
    expect(transformed.firstTerm[0].code).toBe('CS101')
    expect(transformed.secondTerm).toHaveLength(1)
    expect(transformed.secondTerm[0].code).toBe('MATH101')
  })
})

