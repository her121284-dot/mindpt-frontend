'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import {
  getTutorSeries,
  TutorSeries,
  TutorLesson,
  TutorApiError,
  loadProgress,
  markLessonCompleted,
  updateCurrentPosition,
  isLessonCompleted,
  findNextLessonId,
  findLessonById,
  SeriesId,
  resetTutorProgressAndSession,
  getNextSeriesId,
  getNextSeriesDisplayName,
  SERIES_INFO,
} from '@/lib/tutorApi';
import {
  generateExplanation,
  generateSummary,
  generateHomework,
  generateUnderstandingQuestion,
} from '@/lib/tutorGenerateApi';
import {
  getCachedText,
  setCachedText,
  makeExplainCacheKey,
  makeSummaryCacheKey,
  makeUnderstandingQuestionCacheKey,
  deleteLegacyHomeworkKey,
  // makeHomeworkCacheKey - will be used when understanding selection is added
} from '@/lib/tutorCache';
import CurriculumPanel from '@/components/CurriculumPanel';

type LoadingState = 'loading' | 'success' | 'error';
type LessonState = 'learning' | 'completing' | 'completed';

interface PageState {
  status: LoadingState;
  series: TutorSeries | null;
  currentLesson: TutorLesson | null;
  usedUrl: string | null;
  error: TutorApiError | null;
}

interface CompletionData {
  understandingQuestion: string | null;
  homework: string | null;
  reviewSummary: string | null;
}

export default function TutorPage() {
  return (
    <Suspense fallback={<TutorPageLoading />}>
      <TutorPageContent />
    </Suspense>
  );
}

function TutorPageLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
    </div>
  );
}

function TutorPageContent() {
  const router = useRouter();

  // Content state
  const [state, setState] = useState<PageState>({
    status: 'loading',
    series: null,
    currentLesson: null,
    usedUrl: null,
    error: null,
  });

  // Lesson state
  const [lessonState, setLessonState] = useState<LessonState>('learning');

  // Paragraph navigation state
  const [paragraphIndex, setParagraphIndex] = useState(0);

  // Extra explanation state
  const [extraExplanation, setExtraExplanation] = useState<string | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState<string | null>(null);

  // Completion panel state
  const [completionData, setCompletionData] = useState<CompletionData>({
    understandingQuestion: null,
    homework: null,
    reviewSummary: null,
  });
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  // Curriculum panel state
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [currentSeriesId, setCurrentSeriesId] = useState<SeriesId>('OT');
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // Load content on mount
  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        // Load saved progress first to determine which series to load
        const progress = loadProgress();
        const seriesIdToLoad = progress.currentSeriesId || 'OT';

        const result = await getTutorSeries(seriesIdToLoad);

        if (cancelled) return;

        if (result.series && result.series.lessons.length > 0) {
          // Set completed lessons from progress
          setCompletedLessonIds(progress.completedLessonIds);

          // Set current series ID
          setCurrentSeriesId(seriesIdToLoad);

          // Determine which lesson to start with
          let lessonToLoad: TutorLesson;
          let startParagraphIndex = 0;

          if (progress.currentLessonId && progress.currentLessonId.startsWith(seriesIdToLoad)) {
            const savedLesson = findLessonById(result.series, progress.currentLessonId);
            if (savedLesson) {
              lessonToLoad = savedLesson;
              startParagraphIndex = progress.currentParagraphIndex;
            } else {
              lessonToLoad = result.series.lessons[0];
            }
          } else {
            lessonToLoad = result.series.lessons[0];
          }

          setState({
            status: 'success',
            series: result.series,
            currentLesson: lessonToLoad,
            usedUrl: result.usedUrl,
            error: null,
          });

          setParagraphIndex(startParagraphIndex);

          // Check if this lesson is already completed
          if (isLessonCompleted(lessonToLoad.lessonId)) {
            setLessonState('completed');
          }
        } else {
          setState({
            status: 'error',
            series: null,
            currentLesson: null,
            usedUrl: result.usedUrl,
            error: {
              message: '시리즈 데이터 파싱 실패: 레슨이 없습니다.',
              triedUrls: [result.usedUrl],
            },
          });
        }
      } catch (err) {
        if (cancelled) return;

        const apiError = err as TutorApiError;
        setState({
          status: 'error',
          series: null,
          currentLesson: null,
          usedUrl: null,
          error: apiError.triedUrls
            ? apiError
            : {
                message: String((err as Error).message || '알 수 없는 오류'),
                triedUrls: [],
              },
        });
      }
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save progress when paragraph changes
  useEffect(() => {
    if (state.currentLesson && lessonState === 'learning') {
      updateCurrentPosition(state.currentLesson.lessonId, paragraphIndex);
    }
  }, [paragraphIndex, state.currentLesson, lessonState]);

  // Current paragraph
  const currentParagraph = state.currentLesson?.paragraphs[paragraphIndex] || '';
  const totalParagraphs = state.currentLesson?.paragraphs.length || 0;
  const isLastParagraph = paragraphIndex >= totalParagraphs - 1;

  // Handle next paragraph
  const handleNext = useCallback(() => {
    if (!isLastParagraph) {
      setParagraphIndex(prev => prev + 1);
      setExtraExplanation(null);
      setExplainError(null);
    } else {
      // Last paragraph -> show completion panel
      setLessonState('completing');
      generateCompletionContent();
    }
  }, [isLastParagraph]);

  // Handle extra explanation using /tutor/generate endpoint with caching
  const handleExplain = useCallback(async () => {
    if (!state.currentLesson) {
      setExplainError('레슨이 로드되지 않았습니다.');
      return;
    }

    if (!currentParagraph) {
      setExplainError('설명할 문단이 없습니다.');
      return;
    }

    const { seriesId, lessonId } = state.currentLesson;
    const cacheKey = makeExplainCacheKey(seriesId, lessonId, paragraphIndex);

    // Check cache first
    const cached = getCachedText(cacheKey);
    if (cached) {
      // Cache hit - show immediately without loading state
      setExtraExplanation(cached);
      setExplainError(null);
      return;
    }

    // Cache miss - fetch from API
    setExplainLoading(true);
    setExplainError(null);
    setExtraExplanation(null);

    try {
      const explanation = await generateExplanation(seriesId, lessonId, paragraphIndex);
      setCachedText(cacheKey, explanation);
      setExtraExplanation(explanation);
    } catch (err) {
      console.error('[Tutor] Explain error:', err);
      setExplainError(
        err instanceof Error ? err.message : '추가 설명을 불러오는 중 오류가 발생했습니다.'
      );
    } finally {
      setExplainLoading(false);
    }
  }, [state.currentLesson, currentParagraph, paragraphIndex]);

  // Generate completion content using /tutor/generate endpoint with caching
  // (understanding question, homework, review summary)
  // NOTE: homework caching requires understanding level selection (future feature)
  const generateCompletionContent = useCallback(async () => {
    if (!state.currentLesson) return;

    const { seriesId, lessonId, paragraphs } = state.currentLesson;
    const lastChunkIndex = paragraphs.length - 1;

    // Build cache keys (homework requires understanding, so not cached yet)
    const summaryKey = makeSummaryCacheKey(seriesId, lessonId);
    const uqKey = makeUnderstandingQuestionCacheKey(seriesId, lessonId);

    // Delete legacy homework cache (old key format without understanding)
    deleteLegacyHomeworkKey(seriesId, lessonId);

    // Check cache for summary and understanding question only
    const cachedSummary = getCachedText(summaryKey);
    const cachedUQ = getCachedText(uqKey);
    // Homework is NOT cached until understanding selection is implemented
    // TODO: Add understanding selection UI, then use makeHomeworkCacheKey(seriesId, lessonId, understanding)

    // Some items need to be fetched
    setCompletionLoading(true);
    setCompletionError(null);

    try {
      // Build promise array for missing items only
      const tasks: Promise<{ key: string; cacheKey: string | null; text: string }>[] = [];

      if (!cachedUQ) {
        tasks.push(
          generateUnderstandingQuestion(seriesId, lessonId, lastChunkIndex).then(text => ({
            key: 'uq',
            cacheKey: uqKey,
            text,
          }))
        );
      }

      // Homework is always fetched (no caching without understanding)
      tasks.push(
        generateHomework(seriesId, lessonId, lastChunkIndex).then(text => ({
          key: 'homework',
          cacheKey: null, // Don't cache without understanding
          text,
        }))
      );

      if (!cachedSummary) {
        tasks.push(
          generateSummary(seriesId, lessonId, lastChunkIndex).then(text => ({
            key: 'summary',
            cacheKey: summaryKey,
            text,
          }))
        );
      }

      // Fetch missing items in parallel
      const results = await Promise.all(tasks);

      // Build final data from cache + fresh results
      let finalUQ = cachedUQ;
      let finalHomework: string | null = null;
      let finalSummary = cachedSummary;

      for (const result of results) {
        // Save to cache (only if cacheKey is provided)
        if (result.cacheKey) {
          setCachedText(result.cacheKey, result.text);
        }

        // Assign to final values
        if (result.key === 'uq') finalUQ = result.text;
        if (result.key === 'homework') finalHomework = result.text;
        if (result.key === 'summary') finalSummary = result.text;
      }

      setCompletionData({
        understandingQuestion: finalUQ,
        homework: finalHomework,
        reviewSummary: finalSummary,
      });
    } catch (err) {
      console.error('[Tutor] Completion content error:', err);
      setCompletionError(
        err instanceof Error ? err.message : '완료 콘텐츠를 생성하는 중 오류가 발생했습니다.'
      );
    } finally {
      setCompletionLoading(false);
    }
  }, [state.currentLesson]);

  // Handle lesson completion
  const handleCompleteLesson = useCallback(() => {
    if (!state.currentLesson) return;

    // Mark as completed in localStorage
    const progress = markLessonCompleted(state.currentLesson.lessonId);
    setCompletedLessonIds(progress.completedLessonIds);
    setLessonState('completed');
  }, [state.currentLesson]);

  // Handle next lesson navigation
  const handleNextLesson = useCallback(() => {
    if (!state.series || !state.currentLesson) return;

    const nextLessonId = findNextLessonId(state.series, state.currentLesson.lessonId);

    if (nextLessonId) {
      const nextLesson = findLessonById(state.series, nextLessonId);
      if (nextLesson) {
        setState(prev => ({
          ...prev,
          currentLesson: nextLesson,
        }));
        setParagraphIndex(0);
        setLessonState('learning');
        setExtraExplanation(null);
        setCompletionData({
          understandingQuestion: null,
          homework: null,
          reviewSummary: null,
        });
        updateCurrentPosition(nextLessonId, 0);
      }
    }
  }, [state.series, state.currentLesson]);

  // Handle next series navigation (OT -> U -> L -> C)
  const handleNextSeries = useCallback(async () => {
    const nextSeriesId = getNextSeriesId(currentSeriesId);
    if (!nextSeriesId) return;

    try {
      const result = await getTutorSeries(nextSeriesId);
      if (result.series && result.series.lessons.length > 0) {
        const firstLesson = result.series.lessons[0];

        setState({
          status: 'success',
          series: result.series,
          currentLesson: firstLesson,
          usedUrl: result.usedUrl,
          error: null,
        });

        setCurrentSeriesId(nextSeriesId);
        setParagraphIndex(0);
        setLessonState('learning');
        setExtraExplanation(null);
        setCompletionData({
          understandingQuestion: null,
          homework: null,
          reviewSummary: null,
        });

        // Update progress to new series
        updateCurrentPosition(firstLesson.lessonId, 0);
      }
    } catch (err) {
      console.error('[Tutor] Failed to load next series:', err);
      alert('다음 시리즈를 불러오는 데 실패했습니다.');
    }
  }, [currentSeriesId]);

  // Check if there's a next lesson in current series
  const hasNextLesson = state.series && state.currentLesson
    ? findNextLessonId(state.series, state.currentLesson.lessonId) !== null
    : false;

  // Check if there's a next series available
  const nextSeriesId = getNextSeriesId(currentSeriesId);
  const hasNextSeries = nextSeriesId !== null;

  // Header actions
  const handleCurriculumClick = () => {
    setIsCurriculumOpen(true);
  };

  // Handle lesson selection from curriculum panel
  const handleSelectLesson = useCallback(
    async (seriesId: SeriesId, lessonId: string) => {
      // If selecting from a different series, load that series first
      if (seriesId !== currentSeriesId) {
        try {
          const result = await getTutorSeries(seriesId);
          if (result.series && result.series.lessons.length > 0) {
            const selectedLesson = findLessonById(result.series, lessonId);
            if (!selectedLesson) return;

            setState({
              status: 'success',
              series: result.series,
              currentLesson: selectedLesson,
              usedUrl: result.usedUrl,
              error: null,
            });

            setCurrentSeriesId(seriesId);
            setParagraphIndex(0);
            setLessonState(isLessonCompleted(lessonId) ? 'completed' : 'learning');
            setExtraExplanation(null);
            setExplainError(null);
            setCompletionData({
              understandingQuestion: null,
              homework: null,
              reviewSummary: null,
            });
            setCompletionError(null);

            // Update localStorage
            updateCurrentPosition(lessonId, 0);
          }
        } catch (err) {
          console.error('[Tutor] Failed to load series:', err);
          alert('시리즈를 불러오는 데 실패했습니다.');
        }
        return;
      }

      // Same series - just switch lesson
      if (!state.series) return;

      const selectedLesson = findLessonById(state.series, lessonId);
      if (!selectedLesson) return;

      // Update state
      setState(prev => ({
        ...prev,
        currentLesson: selectedLesson,
      }));
      setParagraphIndex(0);
      setLessonState(isLessonCompleted(lessonId) ? 'completed' : 'learning');
      setExtraExplanation(null);
      setExplainError(null);
      setCompletionData({
        understandingQuestion: null,
        homework: null,
        reviewSummary: null,
      });
      setCompletionError(null);

      // Update localStorage
      updateCurrentPosition(lessonId, 0);
    },
    [currentSeriesId, state.series]
  );

  const handleNewLessonClick = () => {
    const confirmed = window.confirm('새 레슨을 시작할까요? 현재 튜터링 진도가 초기화됩니다.');
    if (confirmed) {
      resetTutorProgressAndSession();
      router.replace('/coach/tutor');
    }
  };

  // Current lesson ID for curriculum panel
  const currentLessonId = state.currentLesson?.lessonId || null;

  return (
    <div className="h-full flex flex-col">
      {/* Curriculum Panel */}
      <CurriculumPanel
        isOpen={isCurriculumOpen}
        onClose={() => setIsCurriculumOpen(false)}
        currentSeriesId={currentSeriesId}
        currentLessonId={currentLessonId}
        completedLessonIds={completedLessonIds}
        onSelectLesson={handleSelectLesson}
      />

      <PageHeader
        title="마음 훈련"
        actions={
          <div className="flex gap-2">
            <button
              onClick={handleCurriculumClick}
              className="text-sm px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              커리큘럼
            </button>
            <button
              onClick={handleNewLessonClick}
              className="text-sm px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
            >
              + 새 레슨
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {/* Loading State */}
          {state.status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">불러오는 중...</p>
            </div>
          )}

          {/* Error State */}
          {state.status === 'error' && state.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                    콘텐츠 로드 실패
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-300 mb-3">
                    {state.error.message}
                  </p>
                  {state.error.triedUrls.length > 0 && (
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3">
                      <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                        시도한 URL:
                      </p>
                      <ul className="text-xs text-red-600 dark:text-red-300 space-y-1 font-mono">
                        {state.error.triedUrls.map((url, i) => (
                          <li key={i}>{url}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {state.status === 'success' && state.currentLesson && (
            <>
              {/* Lesson Info Card */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                      시리즈: {state.currentLesson.seriesId}
                    </span>
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">
                      레슨 #{state.currentLesson.lessonId}
                    </span>
                    {lessonState === 'completed' && (
                      <span className="px-2 py-0.5 bg-amber-400/80 text-amber-900 rounded text-xs font-medium">
                        완료됨
                      </span>
                    )}
                  </div>
                  {lessonState === 'learning' && (
                    <span className="text-sm text-green-100">
                      {paragraphIndex + 1} / {totalParagraphs}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold">{state.currentLesson.title}</h2>
                {state.currentLesson.description && (
                  <p className="text-sm text-green-100 mt-1">{state.currentLesson.description}</p>
                )}
              </div>

              {/* Learning State */}
              {lessonState === 'learning' && (
                <>
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((paragraphIndex + 1) / totalParagraphs) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Current Paragraph Content */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 dark:text-amber-400 text-sm font-bold">
                          {paragraphIndex + 1}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {paragraphIndex + 1}번째 문단
                      </h3>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {currentParagraph}
                      </p>
                    </div>
                  </div>

                  {/* Extra Explanation Card */}
                  {explainLoading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span className="text-blue-600 dark:text-blue-400">추가 설명 생성 중...</span>
                      </div>
                    </div>
                  )}

                  {explainError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                      <p className="text-sm text-red-600 dark:text-red-400">{explainError}</p>
                    </div>
                  )}

                  {extraExplanation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="font-semibold text-blue-700 dark:text-blue-400">추가 설명</h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {extraExplanation}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleNext}
                      className="flex-1 px-4 py-3 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors bg-green-600 hover:bg-green-700 text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {isLastParagraph ? '레슨 완료하기' : '다음'}
                    </button>
                    <button
                      onClick={handleExplain}
                      disabled={explainLoading}
                      className={`flex-1 px-4 py-3 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors ${
                        explainLoading
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      추가 설명
                    </button>
                  </div>
                </>
              )}

              {/* Completing State - Show completion panel */}
              {lessonState === 'completing' && (
                <div className="space-y-4">
                  {completionLoading && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                          레슨 완료 콘텐츠 생성 중...
                        </span>
                      </div>
                    </div>
                  )}

                  {completionError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <p className="text-sm text-red-600 dark:text-red-400">{completionError}</p>
                      <button
                        onClick={generateCompletionContent}
                        className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        다시 시도
                      </button>
                    </div>
                  )}

                  {!completionLoading && !completionError && completionData.understandingQuestion && (
                    <>
                      {/* Understanding Check */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h4 className="font-semibold text-purple-700 dark:text-purple-400">이해도 체크</h4>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {completionData.understandingQuestion}
                        </p>
                      </div>

                      {/* Homework */}
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <h4 className="font-semibold text-amber-700 dark:text-amber-400">오늘의 숙제</h4>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {completionData.homework}
                        </p>
                      </div>

                      {/* Review Summary */}
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <h4 className="font-semibold text-green-700 dark:text-green-400">핵심 요약</h4>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {completionData.reviewSummary}
                        </p>
                      </div>

                      {/* Complete Button */}
                      <button
                        onClick={handleCompleteLesson}
                        className="w-full px-4 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        레슨 완료!
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Completed State - Show summary and next lesson button */}
              {lessonState === 'completed' && (
                <div className="space-y-4">
                  {/* Completion Badge */}
                  <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 text-white text-center">
                    <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <h3 className="text-2xl font-bold mb-1">레슨 완료!</h3>
                    <p className="text-amber-100">"{state.currentLesson.title}" 학습을 마쳤습니다.</p>
                  </div>

                  {/* Review Summary if available */}
                  {completionData.reviewSummary && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <h4 className="font-semibold text-green-700 dark:text-green-400">핵심 요약</h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {completionData.reviewSummary}
                      </p>
                    </div>
                  )}

                  {/* Homework reminder if available */}
                  {completionData.homework && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h4 className="font-semibold text-amber-700 dark:text-amber-400">숙제를 잊지 마세요!</h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {completionData.homework}
                      </p>
                    </div>
                  )}

                  {/* Next Lesson or Series Button */}
                  {hasNextLesson ? (
                    <button
                      onClick={handleNextLesson}
                      className="w-full px-4 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      다음 레슨 시작하기
                    </button>
                  ) : hasNextSeries && nextSeriesId ? (
                    <>
                      {/* Series Complete Badge */}
                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center">
                        <svg className="w-12 h-12 mx-auto mb-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-1">
                          {SERIES_INFO[currentSeriesId].title} 시리즈 완료!
                        </h4>
                        <p className="text-sm text-purple-600 dark:text-purple-400">
                          다음 단계인 {getNextSeriesDisplayName(nextSeriesId)}로 넘어갈 준비가 되었어요.
                        </p>
                      </div>

                      {/* Next Series Button */}
                      <button
                        onClick={handleNextSeries}
                        className="w-full px-4 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {getNextSeriesDisplayName(nextSeriesId)} 시작하기
                      </button>
                    </>
                  ) : (
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl p-6 text-center text-white">
                      <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <h4 className="text-xl font-bold mb-1">모든 시리즈 완료!</h4>
                      <p className="text-green-100">
                        축하합니다! 마인드피티의 모든 커리큘럼을 완료했습니다.
                      </p>
                    </div>
                  )}

                  {/* Replay current lesson option */}
                  <button
                    onClick={() => {
                      setParagraphIndex(0);
                      setLessonState('learning');
                      setExtraExplanation(null);
                      setCompletionData({
                        understandingQuestion: null,
                        homework: null,
                        reviewSummary: null,
                      });
                    }}
                    className="w-full px-4 py-3 text-gray-600 dark:text-gray-400 font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    이 레슨 다시 학습하기
                  </button>
                </div>
              )}
            </>
          )}

          {/* Back to Coach Chat Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/coach')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              코칭챗으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
