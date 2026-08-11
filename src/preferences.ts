export type AnimationLevel = 'low' | 'normal' | 'high'
export type ThemeMode = 'light' | 'dark' | 'system'

export type AppPreferences = {
  animationLevel: AnimationLevel
  bubbleCount: number
  musicEnabled: boolean
  rememberWindows: boolean
  themeMode: ThemeMode
}

export const APP_PREFERENCES_KEY = 'bubble-space-v2-preferences'

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  animationLevel: 'normal',
  bubbleCount: 24,
  musicEnabled: true,
  rememberWindows: false,
  themeMode: 'light',
}

function isAnimationLevel(value: unknown): value is AnimationLevel {
  return value === 'low' || value === 'normal' || value === 'high'
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function readAppPreferences(): AppPreferences {
  try {
    const stored = window.localStorage.getItem(APP_PREFERENCES_KEY)
    if (!stored) return DEFAULT_APP_PREFERENCES

    const parsed = JSON.parse(stored) as Partial<AppPreferences>
    const bubbleCount = Number(parsed.bubbleCount)

    return {
      animationLevel: isAnimationLevel(parsed.animationLevel)
        ? parsed.animationLevel
        : DEFAULT_APP_PREFERENCES.animationLevel,
      bubbleCount: Number.isFinite(bubbleCount)
        ? Math.min(36, Math.max(0, Math.round(bubbleCount / 6) * 6))
        : DEFAULT_APP_PREFERENCES.bubbleCount,
      musicEnabled: typeof parsed.musicEnabled === 'boolean'
        ? parsed.musicEnabled
        : DEFAULT_APP_PREFERENCES.musicEnabled,
      rememberWindows: typeof parsed.rememberWindows === 'boolean'
        ? parsed.rememberWindows
        : DEFAULT_APP_PREFERENCES.rememberWindows,
      themeMode: isThemeMode(parsed.themeMode)
        ? parsed.themeMode
        : DEFAULT_APP_PREFERENCES.themeMode,
    }
  } catch {
    return DEFAULT_APP_PREFERENCES
  }
}
