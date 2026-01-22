'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import {
  settings,
  AppSettings,
  IntensityLevel,
  FontSize,
  AlarmTime,
  AlarmRepeat,
  Weekday,
} from '@/lib/settings';

interface SettingsPageProps {
  title: string;
  backHref: string;
}

const intensityOptions: { value: IntensityLevel; label: string; description: string }[] = [
  { value: 'OFF', label: 'OFF', description: '알림 없음' },
  { value: 'Gentle', label: 'Gentle', description: '부드럽게 격려' },
  { value: 'Coach', label: 'Coach', description: '적극적 코칭' },
  { value: 'Drill', label: 'Drill', description: '강력한 독려' },
];

const fontSizeOptions: { value: FontSize; label: string }[] = [
  { value: 'small', label: '작게' },
  { value: 'default', label: '기본' },
  { value: 'large', label: '크게' },
];

const alarmTimeOptions: { value: AlarmTime; label: string }[] = [
  { value: 'morning', label: '아침 (08:00)' },
  { value: 'evening', label: '저녁 (20:00)' },
];

const alarmRepeatOptions: { value: AlarmRepeat; label: string }[] = [
  { value: 'daily', label: '매일' },
  { value: 'weekdays', label: '평일' },
  { value: 'weekends', label: '주말' },
  { value: 'custom', label: '요일 선택' },
];

const weekdays: { value: Weekday; label: string }[] = [
  { value: 'mon', label: '월' },
  { value: 'tue', label: '화' },
  { value: 'wed', label: '수' },
  { value: 'thu', label: '목' },
  { value: 'fri', label: '금' },
  { value: 'sat', label: '토' },
  { value: 'sun', label: '일' },
];

export default function SettingsPage({ title, backHref }: SettingsPageProps) {
  const router = useRouter();
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setAppSettings(settings.getSettings());
  }, []);

  if (!appSettings) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const handleIntensityChange = (value: IntensityLevel) => {
    const updated = settings.updateSetting('intensity', value);
    setAppSettings(updated);
  };

  const handleFontSizeChange = (value: FontSize) => {
    const updated = settings.updateSetting('fontSize', value);
    setAppSettings(updated);
  };

  const handleAlarmToggle = (key: 'enabled' | 'sound' | 'vibration') => {
    const updated = settings.updateAlarm(key, !appSettings.alarm[key]);
    setAppSettings(updated);
  };

  const handleAlarmTimeChange = (value: AlarmTime) => {
    const updated = settings.updateAlarm('time', value);
    setAppSettings(updated);
  };

  const handleAlarmRepeatChange = (value: AlarmRepeat) => {
    const updated = settings.updateAlarm('repeat', value);
    setAppSettings(updated);
  };

  const handleCustomDayToggle = (day: Weekday) => {
    const currentDays = appSettings.alarm.customDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    const updated = settings.updateAlarm('customDays', newDays);
    setAppSettings(updated);
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={title}
        onBack={() => router.push(backHref)}
      />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* A) 강도 설정 카드 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              강도 설정
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {intensityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleIntensityChange(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    appSettings.intensity === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <p className={`font-medium ${
                    appSettings.intensity === option.value
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* B) 알람 설정 카드 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              알람 설정
            </h3>

            {/* 토글 스위치들 */}
            <div className="space-y-4">
              {/* 알람 on/off */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">알람</span>
                <button
                  onClick={() => handleAlarmToggle('enabled')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    appSettings.alarm.enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      appSettings.alarm.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 소리 on/off */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">소리</span>
                <button
                  onClick={() => handleAlarmToggle('sound')}
                  disabled={!appSettings.alarm.enabled}
                  className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${
                    appSettings.alarm.sound ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      appSettings.alarm.sound ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 진동 on/off */}
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">진동</span>
                <button
                  onClick={() => handleAlarmToggle('vibration')}
                  disabled={!appSettings.alarm.enabled}
                  className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 ${
                    appSettings.alarm.vibration ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      appSettings.alarm.vibration ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 시간 선택 */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">알람 시간</p>
                <div className="flex gap-3">
                  {alarmTimeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAlarmTimeChange(option.value)}
                      disabled={!appSettings.alarm.enabled}
                      className={`flex-1 py-2 px-3 rounded-lg border transition-all disabled:opacity-50 ${
                        appSettings.alarm.time === option.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 반복 선택 */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">반복</p>
                <div className="flex flex-wrap gap-2">
                  {alarmRepeatOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAlarmRepeatChange(option.value)}
                      disabled={!appSettings.alarm.enabled}
                      className={`py-2 px-4 rounded-lg border transition-all disabled:opacity-50 ${
                        appSettings.alarm.repeat === option.value
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 요일 선택 (커스텀일 때만 표시) */}
              {appSettings.alarm.repeat === 'custom' && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">요일 선택</p>
                  <div className="flex gap-2">
                    {weekdays.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => handleCustomDayToggle(day.value)}
                        disabled={!appSettings.alarm.enabled}
                        className={`w-10 h-10 rounded-full border transition-all disabled:opacity-50 ${
                          appSettings.alarm.customDays.includes(day.value)
                            ? 'border-indigo-500 bg-indigo-500 text-white'
                            : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* C) 글자 크기 카드 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
              글자 크기
            </h3>
            <div className="flex gap-3">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFontSizeChange(option.value)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                    appSettings.fontSize === option.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <p className={`font-medium ${
                    appSettings.fontSize === option.value
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-900 dark:text-white'
                  } ${option.value === 'small' ? 'text-sm' : option.value === 'large' ? 'text-lg' : 'text-base'}`}>
                    {option.label}
                  </p>
                </button>
              ))}
            </div>
            {/* 미리보기 */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className={`text-gray-700 dark:text-gray-300 ${settings.getFontSizeClass(appSettings.fontSize)}`}>
                글자 크기 미리보기: 안녕하세요!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
