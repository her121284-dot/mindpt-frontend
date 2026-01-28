/**
 * Tutor Series Policy - Sequential progression enforcement
 * OT → U → L → C strict order
 */

import { TutorProgress, loadProgress, saveProgress, SERIES_ORDER, SeriesId } from './tutorApi';

export { SERIES_ORDER, type SeriesId };

/**
 * Get the index of a series in the progression order
 */
export function getSeriesIndex(seriesId: SeriesId): number {
  return SERIES_ORDER.indexOf(seriesId);
}

/**
 * Check if a series has at least one completed lesson
 */
export function hasCompletedLessonInSeries(
  seriesId: SeriesId,
  completedLessonIds: string[]
): boolean {
  return completedLessonIds.some(id => id.startsWith(seriesId + '-'));
}

/**
 * Check if a series is reachable based on progress
 * A series is reachable only if ALL previous series have at least one completed lesson
 */
export function isSeriesReachable(
  targetSeriesId: SeriesId,
  progress: TutorProgress
): boolean {
  const targetIndex = getSeriesIndex(targetSeriesId);
  if (targetIndex === 0) return true; // OT is always reachable

  // Check ALL previous series have at least one completed lesson
  for (let i = 0; i < targetIndex; i++) {
    const prevSeriesId = SERIES_ORDER[i];
    if (!hasCompletedLessonInSeries(prevSeriesId, progress.completedLessonIds)) {
      return false;
    }
  }
  return true;
}

/**
 * Check if a specific lesson is reachable
 * Lesson is reachable if:
 * 1. Its series is reachable
 * 2. All previous lessons in the same series are completed OR it's the first uncompleted lesson
 */
export function isLessonReachable(
  seriesId: SeriesId,
  lessonId: string,
  lessonIndex: number,
  progress: TutorProgress
): boolean {
  // First check if series is reachable
  if (!isSeriesReachable(seriesId, progress)) {
    return false;
  }

  // If it's completed, it's reachable (can revisit)
  if (progress.completedLessonIds.includes(lessonId)) {
    return true;
  }

  // If it's the current lesson, it's reachable
  if (progress.currentLessonId === lessonId) {
    return true;
  }

  // First lesson in series is always reachable (if series is reachable)
  if (lessonIndex === 0) {
    return true;
  }

  // Check if previous lesson is completed
  const prevLessonId = `${seriesId}-${lessonIndex}`; // e.g., OT-1 for index 1 (OT-2)
  return progress.completedLessonIds.includes(prevLessonId);
}

/**
 * Get the first reachable series that is not yet started
 * Used for determining where to redirect
 */
export function getFirstReachableSeries(progress: TutorProgress): SeriesId {
  for (const seriesId of SERIES_ORDER) {
    if (isSeriesReachable(seriesId, progress)) {
      // Check if this series has any progress
      const hasProgress = progress.completedLessonIds.some(id => id.startsWith(seriesId + '-'));
      if (!hasProgress || seriesId === progress.currentSeriesId) {
        return seriesId;
      }
    }
  }
  return 'OT';
}

/**
 * Sanitize progress to ensure it's valid
 * If currentSeriesId is not reachable, reset to a valid state
 */
export function sanitizeProgress(progress: TutorProgress): TutorProgress {
  if (!isSeriesReachable(progress.currentSeriesId, progress)) {
    console.warn('[TutorPolicy] Invalid progress detected, resetting to valid state');
    const validSeriesId = getFirstReachableSeries({ ...progress, currentSeriesId: 'OT' });
    return {
      ...progress,
      currentSeriesId: validSeriesId,
      currentLessonId: null,
      currentParagraphIndex: 0,
    };
  }
  return progress;
}

/**
 * Load and sanitize progress
 * Use this instead of loadProgress() for safer access
 */
export function loadSanitizedProgress(): TutorProgress {
  const progress = loadProgress();
  const sanitized = sanitizeProgress(progress);

  // Save if sanitization changed anything
  if (sanitized !== progress) {
    saveProgress(sanitized);
  }

  return sanitized;
}
