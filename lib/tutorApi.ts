/**
 * Tutor API utilities for fetching curriculum content
 * Supports multiple endpoint fallbacks for backend compatibility
 */

import { auth } from './auth';

// API proxy base URL (matches existing api.ts pattern)
const API_BASE_URL = '/api/proxy';

// ============================================================================
// DEV FLAGS: Development mode settings
// TODO: Set all to false before production deployment!
// ============================================================================

/** Bypass series/lesson locking restrictions */
export const DEV_UNLOCK_ALL_LESSONS = true;

/** Skip authentication for tutor AI generation (render_block, explain, etc.) */
export const DEV_SKIP_TUTOR_AUTH = true;

// ============================================================================
// localStorage Progress Schema (MVP)
// ============================================================================

const TUTOR_PROGRESS_KEY = 'tutor_progress_v1';

export interface TutorProgress {
  currentSeriesId: 'OT' | 'U' | 'L' | 'C';  // Step 9: track current series
  completedLessonIds: string[];  // e.g., ["OT-1", "OT-2", "U-1"]
  currentLessonId: string | null;
  currentParagraphIndex: number;
  lastUpdated: string;  // ISO timestamp
}

const DEFAULT_PROGRESS: TutorProgress = {
  currentSeriesId: 'OT',
  completedLessonIds: [],
  currentLessonId: null,
  currentParagraphIndex: 0,
  lastUpdated: new Date().toISOString(),
};

// Series order for progression
export const SERIES_ORDER: readonly ('OT' | 'U' | 'L' | 'C')[] = ['OT', 'U', 'L', 'C'] as const;

/**
 * Infer series ID from lesson ID prefix
 */
function inferSeriesFromLessonId(lessonId: string | null): 'OT' | 'U' | 'L' | 'C' {
  if (!lessonId) return 'OT';
  const prefix = lessonId.split('-')[0]?.toUpperCase();
  if (prefix === 'OT' || prefix === 'U' || prefix === 'L' || prefix === 'C') {
    return prefix as 'OT' | 'U' | 'L' | 'C';
  }
  return 'OT';
}

/**
 * Load tutor progress from localStorage
 * Includes migration for old schema without currentSeriesId
 */
export function loadProgress(): TutorProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;

  try {
    const stored = localStorage.getItem(TUTOR_PROGRESS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);

      // Migration: add currentSeriesId if missing (old schema)
      if (!parsed.currentSeriesId) {
        parsed.currentSeriesId = inferSeriesFromLessonId(parsed.currentLessonId);
        console.log('[TutorAPI] Migrated progress: added currentSeriesId =', parsed.currentSeriesId);
        // Save migrated data
        localStorage.setItem(TUTOR_PROGRESS_KEY, JSON.stringify({
          ...parsed,
          lastUpdated: new Date().toISOString(),
        }));
      }

      return parsed as TutorProgress;
    }
  } catch (e) {
    console.error('[TutorAPI] Failed to load progress:', e);
  }

  return { ...DEFAULT_PROGRESS };
}

/**
 * Save tutor progress to localStorage
 */
export function saveProgress(progress: TutorProgress): void {
  if (typeof window === 'undefined') return;

  try {
    const updated = {
      ...progress,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(TUTOR_PROGRESS_KEY, JSON.stringify(updated));
    console.log('[TutorAPI] Progress saved:', updated);
  } catch (e) {
    console.error('[TutorAPI] Failed to save progress:', e);
  }
}

/**
 * Mark a lesson as completed
 */
export function markLessonCompleted(lessonId: string): TutorProgress {
  const progress = loadProgress();

  if (!progress.completedLessonIds.includes(lessonId)) {
    progress.completedLessonIds.push(lessonId);
  }

  saveProgress(progress);
  return progress;
}

/**
 * Update current lesson position
 * Automatically updates currentSeriesId based on lessonId prefix
 */
export function updateCurrentPosition(lessonId: string, paragraphIndex: number): TutorProgress {
  const progress = loadProgress();
  progress.currentLessonId = lessonId;
  progress.currentParagraphIndex = paragraphIndex;
  progress.currentSeriesId = inferSeriesFromLessonId(lessonId);
  saveProgress(progress);
  return progress;
}

/**
 * Check if a lesson is completed
 */
export function isLessonCompleted(lessonId: string): boolean {
  const progress = loadProgress();
  return progress.completedLessonIds.includes(lessonId);
}

// Session key constant (shared with page.tsx)
export const TUTOR_SESSION_KEY = 'tutor_session_id';

/**
 * Reset tutor progress and session - for "새 레슨" functionality
 * Clears both progress data and session ID from localStorage
 */
export function resetTutorProgressAndSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(TUTOR_PROGRESS_KEY);
    localStorage.removeItem(TUTOR_SESSION_KEY);
    console.log('[TutorAPI] Progress and session reset');
  } catch (e) {
    console.error('[TutorAPI] Failed to reset progress:', e);
  }
}

// Fallback endpoints to try in order
const OT_ENDPOINTS = [
  '/content/series/OT',  // Primary endpoint (singular 'content')
];

export interface TutorApiError {
  message: string;
  triedUrls: string[];
}

export interface LessonChunk {
  id?: string;
  text: string;
  order?: number;
}

export interface Lesson {
  id: string;
  title: string;
  series?: string;
  chunks: LessonChunk[];
}

export interface LessonPreview {
  seriesId: string;
  lessonId: string;
  lessonTitle: string;
  firstChunkText: string;
}

/**
 * Full lesson with all paragraphs for Step 4
 */
export interface TutorLesson {
  seriesId: string;
  lessonId: string;
  title: string;
  description?: string;
  paragraphs: string[];  // All chunk texts as array
}

/**
 * Series with all lessons for navigation
 */
export interface TutorSeries {
  seriesId: string;
  title: string;
  description: string;
  lessons: TutorLesson[];
}

/**
 * Safely extract first lesson preview from various response formats
 */
export function extractFirstLessonPreview(data: unknown): LessonPreview | null {
  try {
    // Handle array response (list of lessons)
    if (Array.isArray(data) && data.length > 0) {
      const firstLesson = data[0];
      return extractFromLesson(firstLesson, 'OT');
    }

    // Handle object with lessons array
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;

      // Check for { lessons: [...] }
      if (Array.isArray(obj.lessons) && obj.lessons.length > 0) {
        const seriesId = (obj.series as string) || (obj.id as string) || 'OT';
        return extractFromLesson(obj.lessons[0], seriesId);
      }

      // Check for { data: [...] }
      if (Array.isArray(obj.data) && obj.data.length > 0) {
        return extractFromLesson(obj.data[0], 'OT');
      }

      // Check for { items: [...] }
      if (Array.isArray(obj.items) && obj.items.length > 0) {
        return extractFromLesson(obj.items[0], 'OT');
      }

      // Check for { content: [...] }
      if (Array.isArray(obj.content) && obj.content.length > 0) {
        return extractFromLesson(obj.content[0], 'OT');
      }

      // Try treating the object itself as a lesson
      if (obj.title || obj.id) {
        return extractFromLesson(obj, 'OT');
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract preview from a single lesson object
 */
function extractFromLesson(lesson: unknown, defaultSeries: string): LessonPreview | null {
  if (!lesson || typeof lesson !== 'object') return null;

  const obj = lesson as Record<string, unknown>;

  const lessonId = String(obj.id || obj.lesson_id || '1');
  const lessonTitle = String(obj.title || obj.name || 'Untitled Lesson');
  const seriesId = String(obj.series || obj.series_id || defaultSeries);

  // Extract first chunk text
  let firstChunkText = '';

  // Check for chunks array
  if (Array.isArray(obj.chunks) && obj.chunks.length > 0) {
    const chunk = obj.chunks[0] as Record<string, unknown>;
    firstChunkText = String(chunk.text || chunk.content || chunk.body || '');
  }
  // Check for content array
  else if (Array.isArray(obj.content) && obj.content.length > 0) {
    const chunk = obj.content[0];
    firstChunkText = typeof chunk === 'string' ? chunk : String((chunk as Record<string, unknown>).text || '');
  }
  // Check for paragraphs array
  else if (Array.isArray(obj.paragraphs) && obj.paragraphs.length > 0) {
    firstChunkText = String(obj.paragraphs[0]);
  }
  // Check for body/text field
  else if (obj.body) {
    firstChunkText = String(obj.body).split('\n')[0] || '';
  }
  else if (obj.text) {
    firstChunkText = String(obj.text).split('\n')[0] || '';
  }
  // Check for description as fallback
  else if (obj.description) {
    firstChunkText = String(obj.description);
  }

  if (!firstChunkText) {
    firstChunkText = '(콘텐츠를 불러올 수 없습니다)';
  }

  return {
    seriesId,
    lessonId,
    lessonTitle,
    firstChunkText,
  };
}

/**
 * Fetch OT series content with multiple endpoint fallbacks
 */
export async function fetchOTContent(): Promise<{ data: unknown; usedUrl: string }> {
  const token = auth.getToken();
  const triedUrls: string[] = [];

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  for (const endpoint of OT_ENDPOINTS) {
    const url = `${API_BASE_URL}${endpoint}`;
    triedUrls.push(url);

    try {
      console.log('[TutorAPI] Trying:', url);
      const response = await fetch(url, { headers });

      if (response.ok) {
        const data = await response.json();
        console.log('[TutorAPI] Success from:', url);
        return { data, usedUrl: url };
      }

      console.log('[TutorAPI] Failed:', url, response.status);
    } catch (err) {
      console.log('[TutorAPI] Error:', url, err);
    }
  }

  // All endpoints failed
  const error: TutorApiError = {
    message: `OT 콘텐츠를 불러올 수 없습니다. 백엔드 /content 엔드포인트를 확인하세요.`,
    triedUrls,
  };

  throw error;
}

/**
 * Main function: Fetch and parse OT lesson preview
 */
export async function getFirstOTLessonPreview(): Promise<{
  preview: LessonPreview | null;
  usedUrl: string;
  rawData: unknown;
}> {
  const { data, usedUrl } = await fetchOTContent();
  const preview = extractFirstLessonPreview(data);
  return { preview, usedUrl, rawData: data };
}

/**
 * Extract full TutorLesson with all paragraphs from API response
 */
export function extractTutorLesson(data: unknown, lessonIndex: number = 0): TutorLesson | null {
  try {
    let lesson: Record<string, unknown> | null = null;
    let seriesId = 'OT';

    // Handle object with lessons array (most common format)
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;

      // Get series ID
      seriesId = String(obj.series || obj.id || 'OT');

      // Find the lessons array
      let lessons: unknown[] = [];
      if (Array.isArray(obj.lessons)) {
        lessons = obj.lessons;
      } else if (Array.isArray(obj.data)) {
        lessons = obj.data;
      } else if (Array.isArray(obj.items)) {
        lessons = obj.items;
      } else if (Array.isArray(data)) {
        lessons = data as unknown[];
      }

      if (lessons.length > lessonIndex) {
        lesson = lessons[lessonIndex] as Record<string, unknown>;
      } else if (obj.title || obj.id) {
        // Object itself might be a lesson
        lesson = obj;
      }
    }

    if (!lesson) return null;

    const lessonId = String(lesson.id || lesson.lesson_id || `${lessonIndex + 1}`);
    const title = String(lesson.title || lesson.name || 'Untitled Lesson');
    const description = lesson.description ? String(lesson.description) : undefined;

    // Extract paragraphs from chunks
    let paragraphs: string[] = [];

    // Priority 1: chunks array with text/content
    if (Array.isArray(lesson.chunks) && lesson.chunks.length > 0) {
      paragraphs = lesson.chunks.map((chunk: unknown) => {
        if (typeof chunk === 'string') return chunk;
        const c = chunk as Record<string, unknown>;
        return String(c.text || c.content || c.body || '');
      }).filter(Boolean);
    }
    // Priority 2: content array
    else if (Array.isArray(lesson.content) && lesson.content.length > 0) {
      paragraphs = lesson.content.map((c: unknown) => {
        if (typeof c === 'string') return c;
        return String((c as Record<string, unknown>).text || '');
      }).filter(Boolean);
    }
    // Priority 3: paragraphs array
    else if (Array.isArray(lesson.paragraphs) && lesson.paragraphs.length > 0) {
      paragraphs = lesson.paragraphs.map((p: unknown) => String(p)).filter(Boolean);
    }
    // Priority 4: body/text field split by double newline
    else if (lesson.body) {
      paragraphs = String(lesson.body).split('\n\n').filter(Boolean);
    }
    else if (lesson.text) {
      paragraphs = String(lesson.text).split('\n\n').filter(Boolean);
    }

    // Fallback: at least one paragraph
    if (paragraphs.length === 0) {
      paragraphs = ['(콘텐츠를 불러올 수 없습니다)'];
    }

    return {
      seriesId,
      lessonId,
      title,
      description,
      paragraphs,
    };
  } catch (e) {
    console.error('[TutorAPI] extractTutorLesson error:', e);
    return null;
  }
}

/**
 * Fetch and parse full TutorLesson with all paragraphs
 */
export async function getTutorLesson(
  seriesId: string = 'OT',
  lessonIndex: number = 0
): Promise<{
  lesson: TutorLesson | null;
  usedUrl: string;
  rawData: unknown;
}> {
  const { data, usedUrl } = await fetchOTContent(); // For now, only OT supported
  const lesson = extractTutorLesson(data, lessonIndex);
  return { lesson, usedUrl, rawData: data };
}

// ============================================================================
// Series Types and Cache for Step 6
// ============================================================================

export type SeriesId = 'OT' | 'U' | 'L' | 'C';

export const SERIES_INFO: Record<SeriesId, { title: string; description: string; available: boolean }> = {
  OT: { title: '오리엔테이션', description: '마인드피티와 함께하는 마음 여행의 첫 걸음', available: true },
  U: { title: '이해하기', description: '나의 마음을 더 깊이 이해하는 시간', available: true },
  L: { title: '레슨', description: '실천을 위한 구체적인 훈련', available: true },
  C: { title: '컴플리트', description: '배운 것을 삶에 적용하는 완성 단계', available: true },
};

/**
 * Normalize series ID to valid SeriesId type
 */
export function normalizeSeriesId(input: string): SeriesId {
  const upper = input.toUpperCase();
  if (upper === 'OT' || upper === 'ORIENTATION') return 'OT';
  if (upper === 'U' || upper === 'UNDERSTANDING' || upper === 'UNDER') return 'U';
  if (upper === 'L' || upper === 'LESSON') return 'L';
  if (upper === 'C' || upper === 'CHALLENGE' || upper === 'COMPLETE') return 'C';
  return 'OT'; // Default fallback
}

// Simple in-memory cache for series data (cleared on page refresh)
const seriesCache = new Map<SeriesId, { series: TutorSeries; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached series or null if not cached/expired
 */
function getCachedSeries(seriesId: SeriesId): TutorSeries | null {
  const cached = seriesCache.get(seriesId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.series;
  }
  return null;
}

/**
 * Cache series data
 */
function setCachedSeries(seriesId: SeriesId, series: TutorSeries): void {
  seriesCache.set(seriesId, { series, timestamp: Date.now() });
}

/**
 * Clear series cache
 */
export function clearSeriesCache(): void {
  seriesCache.clear();
}

// ============================================================================
// Lesson Status Calculation for Step 6
// ============================================================================

export type LessonStatus = 'completed' | 'current' | 'available' | 'locked';

/**
 * Calculate lesson status based on progress
 */
export function calculateLessonStatus(
  lessonId: string,
  lessonIndex: number,
  seriesId: SeriesId,
  currentSeriesId: SeriesId,
  currentLessonId: string | null,
  completedLessonIds: string[]
): LessonStatus {
  // Check if completed
  if (completedLessonIds.includes(lessonId)) {
    return 'completed';
  }

  // If different series and series is not available, lock
  if (seriesId !== currentSeriesId) {
    // Check if any lessons in this series are completed
    const hasCompletedInSeries = completedLessonIds.some(id => id.startsWith(seriesId));
    if (!hasCompletedInSeries && lessonIndex > 0) {
      return 'locked';
    }
    // First lesson in other available series can be available
    if (lessonIndex === 0 && SERIES_INFO[seriesId].available) {
      return 'available';
    }
    return 'locked';
  }

  // Same series logic
  if (lessonId === currentLessonId) {
    return 'current';
  }

  // Find current lesson index in this series
  // Available: next lesson after current, or first if no current
  if (!currentLessonId || !currentLessonId.startsWith(seriesId)) {
    // No current lesson in this series - first lesson is available
    return lessonIndex === 0 ? 'available' : 'locked';
  }

  // Check if this is the next available lesson
  const currentIndex = parseInt(currentLessonId.split('-')[1] || '0', 10) - 1;
  if (lessonIndex === currentIndex + 1) {
    return 'available';
  }

  // If before current lesson and not completed, it's available (can go back)
  if (lessonIndex < currentIndex) {
    return 'available';
  }

  return 'locked';
}

// ============================================================================
// Series-level functions for Step 5
// ============================================================================

/**
 * Extract TutorSeries with all lessons from API response
 */
export function extractTutorSeries(data: unknown): TutorSeries | null {
  try {
    if (!data || typeof data !== 'object') return null;

    const obj = data as Record<string, unknown>;

    const seriesId = String(obj.series || obj.id || 'OT');
    const title = String(obj.title || 'Unknown Series');
    const description = String(obj.description || '');

    // Find the lessons array
    let lessonsRaw: unknown[] = [];
    if (Array.isArray(obj.lessons)) {
      lessonsRaw = obj.lessons;
    } else if (Array.isArray(obj.data)) {
      lessonsRaw = obj.data;
    } else if (Array.isArray(obj.items)) {
      lessonsRaw = obj.items;
    } else if (Array.isArray(data)) {
      lessonsRaw = data as unknown[];
    }

    // Convert each raw lesson to TutorLesson
    const lessons: TutorLesson[] = lessonsRaw.map((lessonRaw, index) => {
      const lesson = lessonRaw as Record<string, unknown>;

      const lessonId = String(lesson.id || lesson.lesson_id || `${index + 1}`);
      const lessonTitle = String(lesson.title || lesson.name || 'Untitled Lesson');
      const lessonDescription = lesson.description ? String(lesson.description) : undefined;

      // Extract paragraphs from chunks
      let paragraphs: string[] = [];

      if (Array.isArray(lesson.chunks) && lesson.chunks.length > 0) {
        paragraphs = lesson.chunks.map((chunk: unknown) => {
          if (typeof chunk === 'string') return chunk;
          const c = chunk as Record<string, unknown>;
          return String(c.text || c.content || c.body || '');
        }).filter(Boolean);
      } else if (Array.isArray(lesson.content) && lesson.content.length > 0) {
        paragraphs = lesson.content.map((c: unknown) => {
          if (typeof c === 'string') return c;
          return String((c as Record<string, unknown>).text || '');
        }).filter(Boolean);
      } else if (Array.isArray(lesson.paragraphs) && lesson.paragraphs.length > 0) {
        paragraphs = lesson.paragraphs.map((p: unknown) => String(p)).filter(Boolean);
      }

      if (paragraphs.length === 0) {
        paragraphs = ['(콘텐츠를 불러올 수 없습니다)'];
      }

      return {
        seriesId,
        lessonId,
        title: lessonTitle,
        description: lessonDescription,
        paragraphs,
      };
    });

    return {
      seriesId,
      title,
      description,
      lessons,
    };
  } catch (e) {
    console.error('[TutorAPI] extractTutorSeries error:', e);
    return null;
  }
}

/**
 * Fetch series content from backend (works for all series: OT/U/L/C)
 */
export async function fetchSeriesContent(seriesId: SeriesId): Promise<{ data: unknown; usedUrl: string }> {
  const token = auth.getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}/content/series/${seriesId}`;

  try {
    console.log('[TutorAPI] Fetching series:', url);
    const response = await fetch(url, { headers });

    if (response.ok) {
      const data = await response.json();
      console.log('[TutorAPI] Success:', seriesId);
      return { data, usedUrl: url };
    }

    console.log('[TutorAPI] Failed:', url, response.status);
    throw new Error(`Series ${seriesId} not found: ${response.status}`);
  } catch (err) {
    console.error('[TutorAPI] Error fetching series:', seriesId, err);
    throw err;
  }
}

/**
 * Fetch and parse full TutorSeries with all lessons
 * Supports caching and all series (OT/U/L/C)
 */
export async function getTutorSeries(
  seriesIdInput: string = 'OT'
): Promise<{
  series: TutorSeries | null;
  usedUrl: string;
  rawData: unknown;
}> {
  const seriesId = normalizeSeriesId(seriesIdInput);

  // Check cache first
  const cached = getCachedSeries(seriesId);
  if (cached) {
    console.log('[TutorAPI] Using cached series:', seriesId);
    return { series: cached, usedUrl: 'cache', rawData: null };
  }

  // Fetch from backend (all series now supported)
  const { data, usedUrl } = await fetchSeriesContent(seriesId);
  const series = extractTutorSeries(data);

  // Cache the result
  if (series) {
    setCachedSeries(seriesId, series);
  }

  return { series, usedUrl, rawData: data };
}

/**
 * Find next lesson ID in series after completing a lesson
 * Returns null if no more lessons
 */
export function findNextLessonId(series: TutorSeries, currentLessonId: string): string | null {
  const currentIndex = series.lessons.findIndex(l => l.lessonId === currentLessonId);

  if (currentIndex === -1) {
    // Current lesson not found, return first lesson
    return series.lessons.length > 0 ? series.lessons[0].lessonId : null;
  }

  const nextIndex = currentIndex + 1;
  if (nextIndex < series.lessons.length) {
    return series.lessons[nextIndex].lessonId;
  }

  // No more lessons in this series
  return null;
}

/**
 * Find lesson by ID in series
 */
export function findLessonById(series: TutorSeries, lessonId: string): TutorLesson | null {
  return series.lessons.find(l => l.lessonId === lessonId) || null;
}

/**
 * Find lesson index by ID in series
 */
export function findLessonIndex(series: TutorSeries, lessonId: string): number {
  return series.lessons.findIndex(l => l.lessonId === lessonId);
}

// ============================================================================
// Series Transition Utilities for Step 9
// ============================================================================

/**
 * Get the next series in order
 * Returns null if current is the last series (C)
 */
export function getNextSeriesId(currentSeriesId: SeriesId): SeriesId | null {
  const currentIndex = SERIES_ORDER.indexOf(currentSeriesId);
  if (currentIndex === -1 || currentIndex >= SERIES_ORDER.length - 1) {
    return null;
  }
  return SERIES_ORDER[currentIndex + 1];
}

/**
 * Get display name for next series transition
 */
export function getNextSeriesDisplayName(nextSeriesId: SeriesId): string {
  const names: Record<SeriesId, string> = {
    OT: '오리엔테이션',
    U: 'UNDER(이해하기)',
    L: 'LESSON(레슨)',
    C: 'COMPLETE(컴플리트)',
  };
  return names[nextSeriesId] || nextSeriesId;
}

/**
 * Check if a series is reachable based on progress
 * A series is reachable if all previous series have at least one completed lesson
 * or if it's the first series (OT)
 */
export function isSeriesReachable(seriesId: SeriesId, completedLessonIds: string[]): boolean {
  const seriesIndex = SERIES_ORDER.indexOf(seriesId);
  if (seriesIndex === 0) return true; // OT is always reachable

  // Check if previous series has at least one completed lesson
  for (let i = 0; i < seriesIndex; i++) {
    const prevSeries = SERIES_ORDER[i];
    const hasCompletedInPrev = completedLessonIds.some(id => id.startsWith(prevSeries + '-'));
    if (!hasCompletedInPrev) {
      return false;
    }
  }
  return true;
}

/**
 * Check if all lessons in a series are completed
 */
export function isSeriesCompleted(series: TutorSeries, completedLessonIds: string[]): boolean {
  if (series.lessons.length === 0) return false;
  return series.lessons.every(lesson => completedLessonIds.includes(lesson.lessonId));
}
