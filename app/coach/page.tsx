'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { loadSanitizedProgress } from '@/lib/tutorSeriesPolicy';

export default function CoachPage() {
  const router = useRouter();
  const [hasProgress, setHasProgress] = useState(false);

  useEffect(() => {
    const progress = loadSanitizedProgress();
    setHasProgress(!!progress.currentLessonId);
  }, []);

  const handleNewLesson = () => {
    router.push('/coach/lessons');
  };

  const handleContinueLesson = () => {
    router.push('/coach/tutor');
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="마음훈련" />

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-4">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">마음훈련 레슨</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              마음을 훈련하여 온전한 삶을 만들어갑니다
            </p>
          </div>

          {/* Buttons */}
          <button
            onClick={handleNewLesson}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 레슨
          </button>

          <button
            onClick={handleContinueLesson}
            disabled={!hasProgress}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold rounded-xl transition-colors border ${
              hasProgress
                ? 'bg-white dark:bg-gray-800 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            레슨 이어서 하기
          </button>

          {!hasProgress && (
            <p className="text-xs text-center text-gray-400 dark:text-gray-500">
              진행 중인 레슨이 없습니다. 새 레슨을 시작해보세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
