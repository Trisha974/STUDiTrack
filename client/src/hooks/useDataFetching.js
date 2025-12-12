/**
 * Custom hook for centralized data fetching with caching
 * Provides loading states, error handling, and intelligent caching
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { useErrorHandler } from './useErrorHandler'


class DataCache {
  constructor() {
    this.cache = new Map()
  }

  set(key, data, ttl = 5 * 60 * 1000) {
    const expiry = Date.now() + ttl
    this.cache.set(key, { data, expiry })
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  delete(key) {
    return this.cache.delete(key)
  }

  has(key) {
    const item = this.cache.get(key)
    if (!item) return false
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }
    return true
  }
}

const globalCache = new DataCache()

export function useDataFetching(addCustomAlert) {
  const [loadingStates, setLoadingStates] = useState(new Map())
  const [errorStates, setErrorStates] = useState(new Map())
  const abortControllers = useRef(new Map())

  const { handleApiError, handleNetworkError } = useErrorHandler(addCustomAlert)

  /**
   * Set loading state for a specific operation
   */
  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev)
      if (isLoading) {
        newMap.set(key, true)
      } else {
        newMap.delete(key)
      }
      return newMap
    })
  }, [])

  /**
   * Set error state for a specific operation
   */
  const setError = useCallback((key, error) => {
    setErrorStates(prev => {
      const newMap = new Map(prev)
      if (error) {
        newMap.set(key, error)
      } else {
        newMap.delete(key)
      }
      return newMap
    })
  }, [])

  /**
   * Check if an operation is currently loading
   */
  const isLoading = useCallback((key) => {
    return loadingStates.has(key)
  }, [loadingStates])

  /**
   * Get error for a specific operation
   */
  const getError = useCallback((key) => {
    return errorStates.get(key) || null
  }, [errorStates])

  /**
   * Clear all loading and error states
   */
  const clearStates = useCallback(() => {
    setLoadingStates(new Map())
    setErrorStates(new Map())
    abortControllers.current.clear()
  }, [])

  /**
   * Abort a specific operation
   */
  const abort = useCallback((key) => {
    const controller = abortControllers.current.get(key)
    if (controller) {
      controller.abort()
      abortControllers.current.delete(key)
    }
    setLoading(key, false)
  }, [setLoading])

  /**
   * Abort all operations
   */
  const abortAll = useCallback(() => {
    abortControllers.current.forEach(controller => controller.abort())
    abortControllers.current.clear()
    clearStates()
  }, [clearStates])

  /**
   * Core fetch function with caching and error handling
   */
  const fetchData = useCallback(async (
    key,
    fetchFunction,
    options = {}
  ) => {
    const {
      cache = true,
      cacheTTL = 5 * 60 * 1000,
      forceRefresh = false,
      showErrorAlert = true,
      onSuccess = null,
      onError = null
    } = options


    if (cache && !forceRefresh) {
      const cachedData = globalCache.get(key)
      if (cachedData !== null) {
        if (onSuccess) onSuccess(cachedData)
        return cachedData
      }
    }


    const controller = new AbortController()
    abortControllers.current.set(key, controller)

    setLoading(key, true)
    setError(key, null)

    try {

      let result
      if (typeof fetchFunction === 'function') {

        result = await fetchFunction({ signal: controller.signal })
      } else {

        result = await fetchFunction
      }


      if (cache) {
        globalCache.set(key, result, cacheTTL)
      }

      setLoading(key, false)
      if (onSuccess) onSuccess(result)

      return result

    } catch (error) {
      setLoading(key, false)

      if (error.name === 'AbortError') {

        return null
      }

      const errorMessage = error.code === 'NETWORK_ERROR' || !navigator.onLine
        ? handleNetworkError(error)
        : handleApiError(error, 'Data Fetch', { showAlert: showErrorAlert })

      setError(key, errorMessage)
      if (onError) onError(error, errorMessage)

      throw error
    } finally {
      abortControllers.current.delete(key)
    }
  }, [setLoading, setError, handleApiError, handleNetworkError])

  /**
   * Fetch with automatic retry logic
   */
  const fetchWithRetry = useCallback(async (
    key,
    fetchFunction,
    options = {}
  ) => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      ...fetchOptions
    } = options

    let lastError

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fetchData(key, fetchFunction, fetchOptions)
      } catch (error) {
        lastError = error

        if (attempt < maxRetries && (
          error.code === 'NETWORK_ERROR' ||
          error.status >= 500 ||
          !navigator.onLine
        )) {

          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
          continue
        }

        break
      }
    }

    throw lastError
  }, [fetchData])

  /**
   * Invalidate cache for specific keys
   */
  const invalidateCache = useCallback((keyOrKeys) => {
    if (Array.isArray(keyOrKeys)) {
      keyOrKeys.forEach(key => globalCache.delete(key))
    } else {
      globalCache.delete(keyOrKeys)
    }
  }, [])

  /**
   * Clear all cache
   */
  const clearCache = useCallback(() => {
    globalCache.clear()
  }, [])

  /**
   * Prefetch data in the background
   */
  const prefetch = useCallback(async (key, fetchFunction, options = {}) => {
    try {
      await fetchData(key, fetchFunction, { ...options, showErrorAlert: false })
    } catch (error) {

      console.warn(`Prefetch failed for ${key}:`, error.message)
    }
  }, [fetchData])

  /**
   * Batch fetch multiple operations
   */
  const batchFetch = useCallback(async (operations) => {
    const promises = operations.map(({ key, fetchFunction, options = {} }) =>
      fetchData(key, fetchFunction, { ...options, showErrorAlert: false })
        .catch(error => ({ error, key }))
    )

    const results = await Promise.allSettled(promises)

    const successful = []
    const failed = []

    results.forEach((result, index) => {
      const { key } = operations[index]
      if (result.status === 'fulfilled') {
        if (result.value && !result.value.error) {
          successful.push({ key, data: result.value })
        } else {
          failed.push({ key, error: result.value?.error })
        }
      } else {
        failed.push({ key, error: result.reason })
      }
    })

    return { successful, failed }
  }, [fetchData])

  /**
   * Create a cached query hook for specific data types
   */
  const createQuery = useCallback((queryKey, fetchFunction, defaultOptions = {}) => {
    return useCallback((options = {}) => {
      const mergedOptions = { ...defaultOptions, ...options }
      return fetchData(queryKey, fetchFunction, mergedOptions)
    }, [queryKey, fetchFunction, defaultOptions])
  }, [fetchData])

  /**
   * Hook cleanup effect
   */
  useEffect(() => {
    return () => {
      abortAll()
    }
  }, [abortAll])

  return {

    fetchData,
    fetchWithRetry,
    batchFetch,
    prefetch,


    isLoading,
    getError,
    clearStates,


    invalidateCache,
    clearCache,


    abort,
    abortAll,


    createQuery,


    cache: globalCache
  }
}