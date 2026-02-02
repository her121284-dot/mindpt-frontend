'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import CurriculumPanel from '@/components/CurriculumPanel';
import {
  getTutorSeries,
  TutorSeries,
  TutorLesson,
  updateCurrentPosition,
  calculateLessonStatus,
  LessonStatus,
  SERIES_INFO,
  SeriesId,
  TutorProgress,
  DEV_UNLOCK_ALL_LESSONS,
} from '@/lib/tutorApi';
import {
  loadSanitizedProgress,
  isSeriesReachable,
} from '@/lib/tutorSeriesPolicy';

type StatusFilter = 'all' | 'completed' | 'current' | 'available';

export default function CoachLessonsPage() {
  return (
    <Suspense fallback={<LessonsPageLoading />}>
      <LessonsPageContent />
    </Suspense>
  );
}

function LessonsPageLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
    </div>
  );
}

function LessonsPageContent() {
  const router = useRouter();
  const [series, setSeries] = useState<TutorSeries | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [showCurriculum, setShowCurriculum] = useState(false);

  // Load progress and fetch series data
  useEffect(() => {
    const init = async () => {
      try {
        // Load sanitized progress from localStorage
        const progress = loadSanitizedProgress();
        setCompletedLessonIds(progress.completedLessonIds);
        setCurrentLessonId(progress.currentLessonId);

        // Fetch OT series
        const { series: fetchedSeries } = await getTutorSeries('OT');
        setSeries(fetchedSeries);
      } catch (e) {
        console.error('[LessonsPage] Failed to load:', e);
        setError('레슨 목록을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleLessonClick = (lesson: TutorLesson, status: LessonStatus) => {
    // DEV_UNLOCK_ALL_LESSONS bypasses lock check
    if (!DEV_UNLOCK_ALL_LESSONS && status === 'locked') return;

    // Check if series is reachable (bypassed by DEV flag)
    if (!DEV_UNLOCK_ALL_LESSONS) {
      const seriesId = lesson.seriesId as SeriesId;
      const progressForCheck: TutorProgress = {
        currentSeriesId: seriesId,
        completedLessonIds,
        currentLessonId,
        currentParagraphIndex: 0,
        lastUpdated: '',
      };
      if (!isSeriesReachable(seriesId, progressForCheck)) {
        console.warn('[LessonsPage] Series not reachable:', seriesId);
        return;
      }
    }

    // Update current position and navigate to tutor
    updateCurrentPosition(lesson.lessonId, 0);
    router.push('/coach/tutor');
  };

  const getStatusBadge = (status: LessonStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            완료
          </span>
        );
      case 'current':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            진행중
          </span>
        );
      case 'available':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
            시작 가능
          </span>
        );
      case 'locked':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            잠김
          </span>
        );
    }
  };

  // Calculate stats
  const stats = series
    ? {
        completed: series.lessons.filter((_, i) =>
          calculateLessonStatus(
            series.lessons[i].lessonId,
            i,
            'OT' as SeriesId,
            'OT' as SeriesId,
            currentLessonId,
            completedLessonIds
          ) === 'completed'
        ).length,
        inProgress: series.lessons.filter((_, i) =>
          calculateLessonStatus(
            series.lessons[i].lessonId,
            i,
            'OT' as SeriesId,
            'OT' as SeriesId,
            currentLessonId,
            completedLessonIds
          ) === 'current'
        ).length,
        available: series.lessons.filter((_, i) =>
          calculateLessonStatus(
            series.lessons[i].lessonId,
            i,
            'OT' as SeriesId,
            'OT' as SeriesId,
            currentLessonId,
            completedLessonIds
          ) === 'available'
        ).length,
      }
    : { completed: 0, inProgress: 0, available: 0 };

  const handleFilterClick = (f: StatusFilter) => {
    setFilter(prev => prev === f ? 'all' : f);
  };

  const handleCurriculumSelect = (seriesId: SeriesId, lessonId: string) => {
    updateCurrentPosition(lessonId, 0);
    setShowCurriculum(false);
    router.push('/coach/tutor');
  };

  if (loading) {
    return <LessonsPageLoading />;
  }

  // Build lesson statuses for filtering
  const lessonsWithStatus = series
    ? series.lessons.map((lesson, index) => {
        let status = calculateLessonStatus(
          lesson.lessonId,
          index,
          'OT' as SeriesId,
          'OT' as SeriesId,
          currentLessonId,
          completedLessonIds
        );
        if (DEV_UNLOCK_ALL_LESSONS && status === 'locked') {
          status = 'available';
        }
        return { lesson, index, status };
      })
    : [];

  const visibleLessons = filter === 'all'
    ? lessonsWithStatus
    : lessonsWithStatus.filter(l => l.status === filter);

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="레슨 목록"
        actions={
          <button
            onClick={() => setShowCurriculum(true)}
            className="text-sm px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-colors font-medium"
          >
            커리큘럼
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {/* Series Header + Filter Chips */}
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 text-sm font-semibold bg-green-600 text-white rounded-full">
                OT
              </span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {SERIES_INFO.OT.title}
              </h2>
              {series && series.lessons.length > 0 && (
                <div className="flex items-center gap-1.5 md:ml-auto flex-wrap">
                  <button
                    onClick={() => handleFilterClick('completed')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
                      filter === 'completed'
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                  >
                    완료 {stats.completed}
                  </button>
                  <button
                    onClick={() => handleFilterClick('current')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
                      filter === 'current'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                    }`}
                  >
                    진행중 {stats.inProgress}
                  </button>
                  <button
                    onClick={() => handleFilterClick('available')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
                      filter === 'available'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                    }`}
                  >
                    시작가능 {stats.available}
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {SERIES_INFO.OT.description}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-700 dark:text-red-300 underline"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* Empty State */}
          {!error && series && series.lessons.length === 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                아직 레슨이 없습니다
              </p>
            </div>
          )}

          {/* Lesson List */}
          {series && series.lessons.length > 0 && (
            <>
              {/* Filter active notice */}
              {filter !== 'all' && (
                <div className="mb-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>필터 적용됨: {visibleLessons.length}개</span>
                  <button
                    onClick={() => setFilter('all')}
                    className="text-indigo-500 hover:text-indigo-600 underline"
                  >
                    전체 보기
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {visibleLessons.map(({ lesson, index, status }) => {
                  const isClickable = status !== 'locked';

                  return (
                    <div
                      key={lesson.lessonId}
                      onClick={() => handleLessonClick(lesson, status)}
                      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all ${
                        isClickable
                          ? 'hover:shadow-md hover:border-green-300 dark:hover:border-green-700 cursor-pointer'
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                              {lesson.lessonId}
                            </span>
                          </div>
                          <h3 className={`font-semibold ${
                            isClickable
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-500 dark:text-gray-500'
                          }`}>
                            {lesson.title}
                          </h3>
                          {lesson.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          {getStatusBadge(status)}
                        </div>
                      </div>

                      {/* Lesson content preview for available/current */}
                      {(status === 'current' || status === 'available') && lesson.paragraphs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {lesson.paragraphs[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Curriculum Panel */}
      <CurriculumPanel
        isOpen={showCurriculum}
        onClose={() => setShowCurriculum(false)}
        currentSeriesId={'OT' as SeriesId}
        currentLessonId={currentLessonId}
        completedLessonIds={completedLessonIds}
        onSelectLesson={handleCurriculumSelect}
      />
    </div>
  );
}
