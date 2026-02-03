'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';

// localStorage key for nag settings
const getNagSettingsKey = (mode: string) => `nag_settings_${mode}`;

export interface NagSettings {
  enabled: boolean;
  repeat: 'daily' | 'weekday' | 'weekend';
  time: string;
  pushEnabled: boolean;
  alarmEnabled: boolean;
}

const NAG_MODES = [
  {
    id: 'morning',
    title: '아침루틴',
    description: '하루를 시작하게 만드는 잔소리',
    defaultTime: '07:00',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40',
    iconBg: 'bg-amber-100 dark:bg-amber-900',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'evening',
    title: '저녁 감정 체크',
    description: '회피하지 않게 붙잡고 행동 1개',
    defaultTime: '21:00',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'running',
    title: '러닝 잔소리',
    description: '신발 신게 만드는 최소 행동',
    defaultTime: '18:00',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40',
    iconBg: 'bg-green-100 dark:bg-green-900',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'mandalart',
    title: '만다라트 잔소리',
    description: '목표를 칸으로 쪼개 오늘 1개 실행',
    defaultTime: '20:00',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40',
    iconBg: 'bg-purple-100 dark:bg-purple-900',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];

const REPEAT_LABELS: Record<string, string> = {
  daily: '매일',
  weekday: '주중',
  weekend: '주말',
};

export default function NagPage() {
  const router = useRouter();
  const [settingsMap, setSettingsMap] = useState<Record<string, NagSettings | null>>({});

  // Load settings from localStorage (SSR-safe)
  useEffect(() => {
    const loadedSettings: Record<string, NagSettings | null> = {};
    NAG_MODES.forEach((mode) => {
      const key = getNagSettingsKey(mode.id);
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          loadedSettings[mode.id] = JSON.parse(stored);
        } catch {
          loadedSettings[mode.id] = null;
        }
      } else {
        loadedSettings[mode.id] = null;
      }
    });
    setSettingsMap(loadedSettings);
  }, []);

  const getStatusBadge = (modeId: string) => {
    const settings = settingsMap[modeId];
    if (!settings || !settings.enabled) {
      return (
        <span className="text-xs text-gray-400 dark:text-gray-500">미설정</span>
      );
    }
    return (
      <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
        {REPEAT_LABELS[settings.repeat]} {settings.time}
      </span>
    );
  };

  const handleModeClick = (modeId: string) => {
    router.push(`/nag/${modeId}`);
  };

  const handleSettingsClick = (e: React.MouseEvent, modeId: string) => {
    e.stopPropagation();
    router.push(`/nag/${modeId}/settings`);
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="잔소리챗" />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-3">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">잔소리 모드 선택</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              원하는 잔소리 모드를 선택하세요
            </p>
          </div>

          {/* Mode Buttons */}
          {NAG_MODES.map((mode) => (
            <div key={mode.id} className="flex gap-2">
              {/* Main Mode Button */}
              <button
                onClick={() => handleModeClick(mode.id)}
                className={`flex-1 flex items-center gap-4 p-4 rounded-xl border transition-colors text-left ${mode.color}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${mode.iconBg}`}>
                  <span className={mode.iconColor}>{mode.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{mode.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{mode.description}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Settings Button with Status Badge */}
              <button
                onClick={(e) => handleSettingsClick(e, mode.id)}
                className="w-20 flex flex-col items-center justify-center gap-0.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors py-2"
                title={`${mode.title} 설정`}
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {getStatusBadge(mode.id)}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
