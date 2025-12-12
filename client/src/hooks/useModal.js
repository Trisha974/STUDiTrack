/**
 * Custom hook for managing modal state
 * Reduces boilerplate for modal open/close logic
 */
import { useState, useCallback } from 'react'

/**
 * Hook for managing a single modal's state
 * @param {boolean} initialOpen - Initial open state
 * @returns {[boolean, function, function]} [isOpen, open, close]
 */
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return [isOpen, open, close, toggle]
}

/**
 * Hook for managing multiple modals' state
 * @param {Object} initialStates - Object with modal names as keys and initial states as values
 * @returns {Object} Object with modal names as keys and [isOpen, open, close, toggle] as values
 */
export function useModals(initialStates = {}) {
  const [modals, setModals] = useState(initialStates)

  const getModal = useCallback((name) => {
    const isOpen = modals[name] || false
    const open = () => setModals(prev => ({ ...prev, [name]: true }))
    const close = () => setModals(prev => ({ ...prev, [name]: false }))
    const toggle = () => setModals(prev => ({ ...prev, [name]: !prev[name] }))
    return [isOpen, open, close, toggle]
  }, [modals])

  const closeAll = useCallback(() => {
    setModals(prev => {
      const closed = {}
      Object.keys(prev).forEach(key => {
        closed[key] = false
      })
      return closed
    })
  }, [])

  return { getModal, closeAll }
}


