/**
 * Settings utilities for localStorage management
 */

export type IntensityLevel = 'OFF' | 'Gentle' | 'Coach' | 'Drill';
export type FontSize = 'small' | 'default' | 'large';
export type AlarmTime = 'morning' | 'evening';
export type AlarmRepeat = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface AlarmSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  time: AlarmTime;
  repeat: AlarmRepeat;
  customDays: Weekday[];
}

export interface AppSettings {
  intensity: IntensityLevel;
  alarm: AlarmSettings;
  fontSize: FontSize;
}

const SETTINGS_KEY = 'mindpt_settings';

const defaultSettings: AppSettings = {
  intensity: 'Gentle',
  alarm: {
    enabled: true,
    sound: true,
    vibration: false,
    time: 'morning',
    repeat: 'daily',
    customDays: [],
  },
  fontSize: 'default',
};

export const settings = {
  /**
   * Get all settings from localStorage
   */
  getSettings(): AppSettings {
    if (typeof window === 'undefined') {
      return defaultSettings;
    }
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to parse settings:', e);
    }
    return defaultSettings;
  },

  /**
   * Save all settings to localStorage
   */
  saveSettings(newSettings: AppSettings): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    }
  },

  /**
   * Update specific setting
   */
  updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, [key]: value };
    this.saveSettings(updated);
    return updated;
  },

  /**
   * Update alarm settings
   */
  updateAlarm<K extends keyof AlarmSettings>(key: K, value: AlarmSettings[K]): AppSettings {
    const current = this.getSettings();
    const updated = {
      ...current,
      alarm: { ...current.alarm, [key]: value },
    };
    this.saveSettings(updated);
    return updated;
  },

  /**
   * Reset all settings to default
   */
  resetSettings(): AppSettings {
    this.saveSettings(defaultSettings);
    return defaultSettings;
  },

  /**
   * Get font size class based on settings
   */
  getFontSizeClass(size: FontSize): string {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  },
};
