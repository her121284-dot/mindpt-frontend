'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getTutorSeries,
  TutorSeries,
  SeriesId,
  SERIES_INFO,
  calculateLessonStatus,
  LessonStatus,
} from '@/lib/tutorApi';

interface CurriculumPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSeriesId: SeriesId;
  currentLessonId: string | null;
  completedLessonIds: string[];
  onSelectLesson: (seriesId: SeriesId, lessonId: string) => void;
}

const SERIES_TABS: SeriesId[] = ['OT', 'U', 'L', 'C'];

export default function CurriculumPanel({
  isOpen,
  onClose,
  currentSeriesId,
  currentLessonId,
  completedLessonIds,
  onSelectLesson,
}: CurriculumPanelProps) {
  const [selectedSeriesId, setSelectedSeriesId] = useState<SeriesId>(currentSeriesId);
  const [seriesData, setSeriesData] = useState<TutorSeries | null>(null);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [seriesError, setSeriesError] = useState<string | null>(null);

  // Sync selectedSeriesId when panel opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSeriesId(currentSeriesId);
    }
  }, [isOpen, currentSeriesId]);

  // Load series data when tab changes
  useEffect(() => {
    if (!isOpen) return;

    async function loadSeries() {
      setSeriesLoading(true);
      setSeriesError(null);

      try {
        const result = await getTutorSeries(selectedSeriesId);
        setSeriesData(result.series);
      } catch (err) {
        console.error('[CurriculumPanel] Failed to load series:', err);
        setSeriesError('시리즈를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setSeriesLoading(false);
      }
    }

    loadSeries();
  }, [isOpen, selectedSeriesId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle lesson click
  const handleLessonClick = useCallback(
    (lessonId: string, status: LessonStatus) => {
      if (status === 'locked') return;

      // Check if series is available
      if (!SERIES_INFO[selectedSeriesId].available && selectedSeriesId !== currentSeriesId) {
        return;
      }

      onSelectLesson(selectedSeriesId, lessonId);
      onClose();
    },
    [selectedSeriesId, currentSeriesId, onSelectLesson, onClose]
  );

  // Get status badge styling
  const getStatusBadge = (status: LessonStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
            완료
          </span>
        );
      case 'current':
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
            학습중
          </span>
        );
      case 'available':
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
            시작 가능
          </span>
        );
      case 'locked':
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            잠김
          </span>
        );
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px] max-w-[90vw] bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="커리큘럼"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">커리큘럼</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Series Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {SERIES_TABS.map((tabId) => {
            const info = SERIES_INFO[tabId];
            const isSelected = tabId === selectedSeriesId;
            const isAvailable = info.available;

            return (
              <button
                key={tabId}
                onClick={() => setSelectedSeriesId(tabId)}
                className={`flex-1 py-3 px-2 text-sm font-medium transition-colors relative ${
                  isSelected
                    ? 'text-green-600 dark:text-green-400'
                    : isAvailable
                    ? 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                <span className="flex flex-col items-center gap-0.5">
                  <span>{tabId}</span>
                  {!isAvailable && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-600">준비중</span>
                  )}
                </span>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Series Info */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {SERIES_INFO[selectedSeriesId].title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {SERIES_INFO[selectedSeriesId].description}
          </p>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto">
          {seriesLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
            </div>
          )}

          {seriesError && (
            <div className="p-4 text-center text-red-500 dark:text-red-400">
              {seriesError}
            </div>
          )}

          {!seriesLoading && !seriesError && seriesData && (
            <>
              {!SERIES_INFO[selectedSeriesId].available && (
                <div className="p-4 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    이 시리즈는 아직 준비 중입니다.
                    <br />곧 만나요!
                  </p>
                </div>
              )}

              {SERIES_INFO[selectedSeriesId].available && seriesData.lessons.length === 0 && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  레슨이 없습니다.
                </div>
              )}

              {SERIES_INFO[selectedSeriesId].available && seriesData.lessons.length > 0 && (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {seriesData.lessons.map((lesson, index) => {
                    const status = calculateLessonStatus(
                      lesson.lessonId,
                      index,
                      selectedSeriesId,
                      currentSeriesId,
                      currentLessonId,
                      completedLessonIds
                    );
                    const isClickable = status !== 'locked';

                    return (
                      <li key={lesson.lessonId}>
                        <button
                          onClick={() => handleLessonClick(lesson.lessonId, status)}
                          disabled={!isClickable}
                          className={`w-full px-4 py-3 text-left transition-colors flex items-start gap-3 ${
                            isClickable
                              ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
                              : 'opacity-50 cursor-not-allowed'
                          } ${status === 'current' ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
                        >
                          {/* Lesson Number */}
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              status === 'completed'
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                                : status === 'current'
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                                : status === 'available'
                                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                            }`}
                          >
                            {status === 'completed' ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className={`font-medium truncate ${
                                  isClickable
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-500 dark:text-gray-500'
                                }`}
                              >
                                {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(status)}
                              {lesson.description && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {lesson.description}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          {isClickable && (
                            <svg
                              className="w-5 h-5 text-gray-400 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              완료: {completedLessonIds.length}개 레슨
            </span>
            <span>
              현재: {currentLessonId || '-'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
