/**
 * Enhanced theme management hook with system preference detection,
 * theme persistence, and comprehensive theming capabilities
 */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { STORAGE_KEYS } from '../constants/appConstants'


const THEMES = {
  light: {
    name: 'light',
    displayName: 'Light',
    colors: {
      bg: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        card: '#ffffff',
        input: '#ffffff',
        hover: '#f3f4f6'
      },
      text: {
        primary: '#000000',
        secondary: '#374151',
        muted: '#6b7280',
        accent: '#7A1315'
      },
      border: {
        primary: '#e5e7eb',
        secondary: '#d1d5db',
        focus: '#7A1315'
      },
      accent: {
        primary: '#7A1315',
        hover: '#8B1A1D',
        light: '#fef2f2',
        dark: '#991b1b'
      },
      status: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    }
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
    colors: {
      bg: {
        primary: '#1a1a1a',
        secondary: '#2c2c2c',
        card: '#2c2c2c',
        input: '#1f2937',
        hover: '#374151'
      },
      text: {
        primary: '#ffffff',
        secondary: '#e5e5e5',
        muted: '#9ca3af',
        accent: '#fca5a5'
      },
      border: {
        primary: '#404040',
        secondary: '#525252',
        focus: '#7A1315'
      },
      accent: {
        primary: '#7A1315',
        hover: '#8B1A1D',
        light: '#451a03',
        dark: '#dc2626'
      },
      status: {
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#60a5fa'
      }
    }
  },
  auto: {
    name: 'auto',
    displayName: 'Auto (System)',
    colors: {}
  }
}

export function useThemeManagement() {
  const [currentTheme, setCurrentTheme] = useState(() => {

    return localStorage.getItem(STORAGE_KEYS.THEME) || 'auto'
  })

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {

    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  /**
   * Get the effective theme (resolves 'auto' to actual theme)
   */
  const effectiveTheme = useMemo(() => {
    if (currentTheme === 'auto') {
      return systemPrefersDark ? 'dark' : 'light'
    }
    return currentTheme
  }, [currentTheme, systemPrefersDark])

  /**
   * Get theme configuration
   */
  const themeConfig = useMemo(() => {
    if (effectiveTheme === 'auto') {
      return systemPrefersDark ? THEMES.dark : THEMES.light
    }
    return THEMES[effectiveTheme] || THEMES.light
  }, [effectiveTheme, systemPrefersDark])

  /**
   * Check if dark mode is active
   */
  const isDarkMode = useMemo(() => {
    return effectiveTheme === 'dark'
  }, [effectiveTheme])

  /**
   * Apply theme to DOM
   */
  const applyTheme = useCallback((theme) => {
    const root = document.documentElement
    const config = THEMES[theme] || THEMES.light


    Object.entries(config.colors).forEach(([category, colors]) => {
      Object.entries(colors).forEach(([variant, value]) => {
        root.style.setProperty(`--theme-${category}-${variant}`, value)
      })
    })


    document.body.classList.toggle('dark-mode', theme === 'dark')
    document.body.classList.toggle('light-mode', theme === 'light')


    document.body.classList.add('theme-transition')
    setTimeout(() => {
      document.body.classList.remove('theme-transition')
    }, 300)
  }, [])

  /**
   * Set theme with persistence
   */
  const setTheme = useCallback((theme) => {
    if (!THEMES[theme]) {
      console.warn(`Invalid theme: ${theme}. Available themes:`, Object.keys(THEMES))
      return
    }

    setCurrentTheme(theme)
    localStorage.setItem(STORAGE_KEYS.THEME, theme)


    const effectiveThemeToApply = theme === 'auto' ? (systemPrefersDark ? 'dark' : 'light') : theme
    applyTheme(effectiveThemeToApply)
  }, [systemPrefersDark, applyTheme])

  /**
   * Toggle between light and dark (ignores auto)
   */
  const toggleTheme = useCallback(() => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    setTheme(newTheme)
  }, [isDarkMode, setTheme])

  /**
   * Cycle through themes: light -> dark -> auto -> light
   */
  const cycleTheme = useCallback(() => {
    const themes = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }, [currentTheme, setTheme])

  /**
   * Reset to system preference
   */
  const resetToSystem = useCallback(() => {
    setTheme('auto')
  }, [setTheme])

  /**
   * Get CSS classes for themed components
   */
  const getThemeClasses = useCallback((component, variant = 'default') => {
    const themeMap = {
      button: {
        primary: `bg-[var(--theme-accent-primary)] hover:bg-[var(--theme-accent-hover)] text-white`,
        secondary: `bg-[var(--theme-bg-secondary)] hover:bg-[var(--theme-bg-hover)] text-[var(--theme-text-primary)] border border-[var(--theme-border-primary)]`,
        danger: `bg-[var(--theme-status-error)] hover:bg-red-700 text-white`
      },
      card: {
        default: `bg-[var(--theme-bg-card)] border border-[var(--theme-border-primary)] shadow-sm`,
        elevated: `bg-[var(--theme-bg-card)] border border-[var(--theme-border-primary)] shadow-lg`
      },
      input: {
        default: `bg-[var(--theme-bg-input)] border border-[var(--theme-border-primary)] text-[var(--theme-text-primary)] focus:border-[var(--theme-border-focus)] focus:ring-2 focus:ring-[var(--theme-accent-light)]`,
        error: `bg-[var(--theme-bg-input)] border border-[var(--theme-status-error)] text-[var(--theme-text-primary)] focus:border-[var(--theme-status-error)] focus:ring-2 focus:ring-red-100`
      },
      text: {
        primary: `text-[var(--theme-text-primary)]`,
        secondary: `text-[var(--theme-text-secondary)]`,
        muted: `text-[var(--theme-text-muted)]`,
        accent: `text-[var(--theme-accent-primary)]`
      },
      bg: {
        primary: `bg-[var(--theme-bg-primary)]`,
        secondary: `bg-[var(--theme-bg-secondary)]`,
        card: `bg-[var(--theme-bg-card)]`,
        hover: `bg-[var(--theme-bg-hover)]`
      },
      border: {
        primary: `border-[var(--theme-border-primary)]`,
        secondary: `border-[var(--theme-border-secondary)]`,
        focus: `border-[var(--theme-border-focus)]`
      }
    }

    return themeMap[component]?.[variant] || ''
  }, [])

  /**
   * Get theme-aware colors for charts/data visualization
   */
  const getChartColors = useCallback(() => {
    const config = themeConfig.colors
    return {
      primary: config.accent.primary,
      secondary: config.accent.hover,
      success: config.status.success,
      warning: config.status.warning,
      error: config.status.error,
      info: config.status.info,
      background: config.bg.card,
      text: config.text.primary,
      grid: config.border.secondary
    }
  }, [themeConfig])

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e) => {
      setSystemPrefersDark(e.matches)


      if (currentTheme === 'auto') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    }


    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {

      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [currentTheme, applyTheme])

  /**
   * Apply theme on mount and theme changes
   */
  useEffect(() => {
    applyTheme(effectiveTheme)
  }, [effectiveTheme, applyTheme])

  return {

    currentTheme,
    effectiveTheme,
    isDarkMode,
    systemPrefersDark,
    themeConfig,


    setTheme,
    toggleTheme,
    cycleTheme,
    resetToSystem,


    availableThemes: THEMES,


    getThemeClasses,
    getChartColors,
    applyTheme
  }
}

