import { useThemeManagement } from './useThemeManagement'

/**
 * Simple theme hook - backward compatibility wrapper
 * Use useThemeManagement for advanced features
 */
export function useTheme() {
  const { isDarkMode, toggleTheme } = useThemeManagement()

  return { isDarkMode, toggleTheme }
}

