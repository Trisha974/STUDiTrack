/**
 * Common async state management hook
 * Eliminates repetitive loading/error state patterns
 */
import { useState, useCallback } from 'react'
import { useErrorHandler } from './useErrorHandler'

export function useAsyncState(addCustomAlert) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const { handleApiError } = useErrorHandler(addCustomAlert)

  /**
   * Execute an async operation with automatic loading/error handling
   */
  const executeAsync = useCallback(async (
    operation,
    options = {}
  ) => {
    const {
      onSuccess = null,
      onError = null,
      errorMessage = 'Operation failed',
      showErrorAlert = true
    } = options

    setIsLoading(true)
    setError(null)

    try {
      const result = await operation()
      if (onSuccess) onSuccess(result)
      return { success: true, data: result }
    } catch (err) {
      const errorMsg = handleApiError(err, errorMessage, { showAlert: showErrorAlert })
      setError(errorMsg)
      if (onError) onError(err, errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }, [handleApiError])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    executeAsync,
    clearError,
    reset,
    setLoading: setIsLoading,
    setError
  }
}

