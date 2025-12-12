/**
 * Basic unit tests for useProfUIState hook
 * Tests state management and reducer actions
 */

import { renderHook, act } from '@testing-library/react'
import { useProfUIState } from '../useProfUIState'

describe('useProfUIState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useProfUIState())
    const [state] = result.current

    expect(state.activeTab).toBe('subjects')
    expect(state.newSubject).toEqual({ code: '', name: '', credits: '', term: 'first' })
    expect(state.showProfileDropdown).toBe(false)
  })

  it('should update activeTab', () => {
    const { result } = renderHook(() => useProfUIState())
    const [, actions] = result.current

    act(() => {
      actions.setActiveTab('grades')
    })

    expect(result.current[0].activeTab).toBe('grades')
  })

  it('should update newSubject', () => {
    const { result } = renderHook(() => useProfUIState())
    const [, actions] = result.current

    act(() => {
      actions.updateNewSubject({ code: 'CS101', name: 'Computer Science' })
    })

    expect(result.current[0].newSubject.code).toBe('CS101')
    expect(result.current[0].newSubject.name).toBe('Computer Science')
    expect(result.current[0].newSubject.credits).toBe('')
  })

  it('should reset newSubject', () => {
    const { result } = renderHook(() => useProfUIState())
    const [, actions] = result.current


    act(() => {
      actions.updateNewSubject({ code: 'CS101', name: 'Computer Science', credits: '3' })
    })


    act(() => {
      actions.resetNewSubject()
    })

    expect(result.current[0].newSubject).toEqual({ code: '', name: '', credits: '', term: 'first' })
  })

  it('should toggle dropdown states', () => {
    const { result } = renderHook(() => useProfUIState())
    const [, actions] = result.current

    act(() => {
      actions.setShowProfileDropdown(true)
    })

    expect(result.current[0].showProfileDropdown).toBe(true)

    act(() => {
      actions.setShowProfileDropdown(false)
    })

    expect(result.current[0].showProfileDropdown).toBe(false)
  })

  it('should update search queries', () => {
    const { result } = renderHook(() => useProfUIState())
    const [, actions] = result.current

    act(() => {
      actions.setSubjectSearchQuery('Computer')
    })

    expect(result.current[0].subjectSearchQuery).toBe('Computer')
  })

  it('should update filter and sort options', () => {
    const { result } = renderHook(() => useProfUIState())
    const [, actions] = result.current

    act(() => {
      actions.setSubjectFilterTerm('first')
      actions.setSubjectSortBy('name')
      actions.setSubjectSortOrder('desc')
    })

    expect(result.current[0].subjectFilterTerm).toBe('first')
    expect(result.current[0].subjectSortBy).toBe('name')
    expect(result.current[0].subjectSortOrder).toBe('desc')
  })
})

