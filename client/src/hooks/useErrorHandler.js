/**
 * Custom hook for centralized error handling
 * Provides consistent error handling and user feedback across the application
 */
import { useCallback } from 'react'
import { ALERT_TYPES } from '../constants/appConstants'

export function useErrorHandler(addCustomAlert) {

  /**
   * Handle API errors with appropriate user feedback
   * @param {Error} error - The error object
   * @param {string} operation - Description of the operation that failed
   * @param {Object} options - Additional options
   */
  const handleApiError = useCallback((error, operation = 'Operation', options = {}) => {
    const {
      showAlert = true,
      alertType = 'error',
      fallbackMessage = 'An unexpected error occurred'
    } = options

    console.error(`${operation} failed:`, error)

    let message = fallbackMessage


    if (error?.response) {

      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          message = data?.message || 'Invalid request data'
          break
        case 401:
          message = 'Authentication required. Please log in again.'
          break
        case 403:
          message = 'You do not have permission to perform this action.'
          break
        case 404:
          message = 'The requested resource was not found.'
          break
        case 409:
          message = data?.message || 'A conflict occurred. Please try again.'
          break
        case 422:
          message = data?.message || 'Validation failed. Please check your input.'
          break
        case 429:
          message = 'Too many requests. Please wait a moment and try again.'
          break
        case 500:
          message = 'Server error. Please try again later.'
          break
        case 503:
          message = 'Service temporarily unavailable. Please try again later.'
          break
        default:
          message = data?.message || `Request failed with status ${status}`
      }
    } else if (error?.request) {

      message = 'Network error. Please check your connection and try again.'
    } else if (error?.message) {

      message = error.message
    }

    if (showAlert) {
      addCustomAlert(alertType, `${operation} Failed`, message, false)
    }

    return message
  }, [addCustomAlert])

  /**
   * Handle validation errors
   * @param {Object} validationResult - Result from validation function
   * @param {string} fieldName - Name of the field being validated
   */
  const handleValidationError = useCallback((validationResult, fieldName = '') => {
    if (!validationResult.isValid) {
      const message = validationResult.error || `${fieldName} validation failed`
      addCustomAlert(ALERT_TYPES.WARNING, 'Validation Error', message, false)
      return false
    }
    return true
  }, [addCustomAlert])

  /**
   * Handle form submission errors
   * @param {Error} error - Form submission error
   * @param {string} formName - Name of the form
   */
  const handleFormError = useCallback((error, formName = 'Form') => {
    return handleApiError(error, `${formName} Submission`, {
      fallbackMessage: `Failed to submit ${formName.toLowerCase()}. Please try again.`
    })
  }, [handleApiError])

  /**
   * Handle file upload errors
   * @param {Error} error - File upload error
   * @param {string} fileType - Type of file being uploaded
   */
  const handleFileError = useCallback((error, fileType = 'File') => {
    let message = `Failed to upload ${fileType.toLowerCase()}`

    if (error?.message?.includes('size')) {
      message = `${fileType} is too large. Please choose a smaller file.`
    } else if (error?.message?.includes('type') || error?.message?.includes('format')) {
      message = `Invalid ${fileType.toLowerCase()} format. Please choose a supported file type.`
    }

    return handleApiError(error, `${fileType} Upload`, {
      fallbackMessage: message
    })
  }, [handleApiError])

  /**
   * Handle database operation errors
   * @param {Error} error - Database error
   * @param {string} operation - Database operation description
   */
  const handleDatabaseError = useCallback((error, operation = 'Database Operation') => {

    if (error?.message?.includes('CSRF')) {
      addCustomAlert(ALERT_TYPES.ERROR, 'Security Error', 'CSRF token error. Please refresh the page and try again.', false)
      return 'CSRF token error'
    }

    if (error?.message?.includes('duplicate') || error?.code === '23505') {
      addCustomAlert(ALERT_TYPES.WARNING, 'Duplicate Entry', 'This item already exists. Please use different values.', false)
      return 'Duplicate entry'
    }

    if (error?.message?.includes('foreign key') || error?.code?.startsWith('23')) {
      addCustomAlert(ALERT_TYPES.ERROR, 'Data Integrity Error', 'Cannot complete operation due to data dependencies.', false)
      return 'Data integrity error'
    }

    return handleApiError(error, operation, {
      fallbackMessage: 'Database operation failed. Please try again.'
    })
  }, [handleApiError, addCustomAlert])

  /**
   * Handle network connectivity errors
   * @param {Error} error - Network error
   */
  const handleNetworkError = useCallback((error) => {
    const isOffline = !navigator.onLine

    if (isOffline) {
      addCustomAlert(ALERT_TYPES.WARNING, 'Offline', 'You appear to be offline. Changes will be saved when connection is restored.', false)
      return 'Offline - changes will be saved when connection is restored'
    }

    return handleApiError(error, 'Network Request', {
      fallbackMessage: 'Connection error. Please check your internet connection and try again.'
    })
  }, [handleApiError, addCustomAlert])

  /**
   * Create a safe async operation wrapper
   * @param {Function} operation - Async operation to wrap
   * @param {Object} options - Error handling options
   * @returns {Function} Wrapped operation
   */
  const createSafeAsyncOperation = useCallback((operation, options = {}) => {
    const {
      operationName = 'Operation',
      onSuccess = null,
      onError = null,
      showAlert = true
    } = options

    return async (...args) => {
      try {
        const result = await operation(...args)
        if (onSuccess) onSuccess(result)
        return result
      } catch (error) {
        const errorMessage = handleApiError(error, operationName, { showAlert })
        if (onError) onError(error, errorMessage)
        throw error
      }
    }
  }, [handleApiError])

  return {
    handleApiError,
    handleValidationError,
    handleFormError,
    handleFileError,
    handleDatabaseError,
    handleNetworkError,
    createSafeAsyncOperation
  }
}
