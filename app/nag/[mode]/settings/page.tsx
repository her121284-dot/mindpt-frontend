'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';

const VALID_MODES = ['morning', 'evening', 'running', 'mandalart'] as const;
type NagMode = typeof VALID_MODES[number];

const MODE_INFO: Record<NagMode, { title: string; defaultTime: string }> = {
  morning: { title: '아침루틴', defaultTime: '07:00' },
  evening: { title: '저녁 감정 체크', defaultTime: '21:00' },
  running: { title: '러닝 잔소리', defaultTime: '18:00' },
  mandalart: { title: '만다라트 잔소리', defaultTime: '20:00' },
};

type RepeatOption = 'daily' | 'weekday' | 'weekend';

interface NagSettings {
  enabled: boolean;
  repeat: RepeatOption;
  time: string;
  pushEnabled: boolean;
  alarmEnabled: boolean;
}

const getNagSettingsKey = (mode: string) => `nag_settings_${mode}`;

export default function NagSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const mode = params.mode as string;

  // Validate mode
  if (!VALID_MODES.includes(mode as NagMode)) {
    notFound();
  }

  const validMode = mode as NagMode;
  const modeInfo = MODE_INFO[validMode];

  // Settings state
  const [enabled, setEnabled] = useState(false);
  const [repeat, setRepeat] = useState<RepeatOption>('daily');
  const [time, setTime] = useState(modeInfo.defaultTime);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Load settings from localStorage (SSR-safe)
  useEffect(() => {
    const key = getNagSettingsKey(mode);
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const settings: NagSettings = JSON.parse(stored);
        setEnabled(settings.enabled);
        setRepeat(settings.repeat);
        setTime(settings.time);
        setPushEnabled(settings.pushEnabled);
        setAlarmEnabled(settings.alarmEnabled);
      } catch {
        // Ignore parse errors
      }
    }
  }, [mode]);

  const handleSave = () => {
    const settings: NagSettings = {
      enabled,
      repeat,
      time,
      pushEnabled,
      alarmEnabled,
    };
    const key = getNagSettingsKey(mode);
    localStorage.setItem(key, JSON.stringify(settings));

    // Show toast
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push('/nag');
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={`${modeInfo.title} 설정`}
        onBack={() => router.push(`/nag/${mode}`)}
      />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Enable/Disable */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">잔소리 활성화</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">설정한 시간에 잔소리를 보내드려요</p>
              </div>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  enabled ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Repeat Options */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-semibold text-gray-900 dark:text-white mb-3">반복</p>
            <div className="flex gap-2">
              {[
                { value: 'daily', label: '매일' },
                { value: 'weekday', label: '주중' },
                { value: 'weekend', label: '주말' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRepeat(option.value as RepeatOption)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    repeat === option.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Picker */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="font-semibold text-gray-900 dark:text-white mb-3">시간</p>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Notification Options */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <p className="font-semibold text-gray-900 dark:text-white">알림 방식</p>

            {/* Push Notification */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">푸시 알림</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">앱 알림으로 받기</p>
                </div>
              </div>
              <button
                onClick={() => setPushEnabled(!pushEnabled)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  pushEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    pushEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Alarm */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">알람</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">소리와 진동으로 받기</p>
                </div>
              </div>
              <button
                onClick={() => setAlarmEnabled(!alarmEnabled)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  alarmEnabled ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    alarmEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200 text-sm">서비스 준비 중</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  일정 예약 및 알림 기능은 곧 제공될 예정입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
          >
            저장
          </button>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400 dark:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">설정이 저장되었습니다</span>
          </div>
        </div>
      )}
    </div>
  );
}
