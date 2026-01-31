/**
 * Tutor Cache - localStorage-based caching for tutor AI generations
 * Reduces API calls by caching explain/summary/homework/understanding_question results
 */

const CACHE_KEY = 'tutor_cache_v1';
const CACHE_VERSION = 1;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_ITEMS = 200;

interface CacheItem {
  text: string;
  createdAt: number;
}

interface CacheData {
  version: number;
  items: Record<string, CacheItem>;
}

// ============================================================================
// Cache Key Generators
// ============================================================================

export function makeExplainCacheKey(
  seriesId: string,
  lessonId: string,
  paragraphIndex: number
): string {
  return `explain:${seriesId}:${lessonId}:${paragraphIndex}`;
}

export function makeSummaryCacheKey(seriesId: string, lessonId: string): string {
  return `summary:${seriesId}:${lessonId}`;
}

/**
 * Create homework cache key
 * Requires understanding level to differentiate homework based on user's comprehension
 * @param understanding - 'understood' | 'partial' | 'not_yet' (required)
 */
export function makeHomeworkCacheKey(
  seriesId: string,
  lessonId: string,
  understanding: string
): string {
  if (!understanding) {
    throw new Error('[TutorCache] understanding is required for homework cache key');
  }
  return `homework:${seriesId}:${lessonId}:${understanding}`;
}

/**
 * Delete legacy homework cache key (without understanding)
 * Call this when generating homework to clean up old cache entries
 */
export function deleteLegacyHomeworkKey(seriesId: string, lessonId: string): void {
  const legacyKey = `homework:${seriesId}:${lessonId}`;
  const data = loadCache();

  if (data.items[legacyKey]) {
    delete data.items[legacyKey];
    saveCache(data);
    console.log('[TutorCache] Deleted legacy homework key:', legacyKey);
  }
}

export function makeUnderstandingQuestionCacheKey(
  seriesId: string,
  lessonId: string
): string {
  return `uq:${seriesId}:${lessonId}`;
}

/**
 * Create render_block cache key
 * Used for caching AI-generated readable blocks for each paragraph
 * @param blockIndex - 0-based index of the paragraph/block
 */
export function makeRenderBlockCacheKey(
  seriesId: string,
  lessonId: string,
  blockIndex: number
): string {
  return `render_block:${seriesId}:${lessonId}:${blockIndex}`;
}

// ============================================================================
// Internal Helpers
// ============================================================================

function loadCache(): CacheData {
  if (typeof window === 'undefined') {
    return { version: CACHE_VERSION, items: {} };
  }

  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) {
      return { version: CACHE_VERSION, items: {} };
    }

    const parsed = JSON.parse(stored) as CacheData;

    // Version check - if different version, reset cache
    if (parsed.version !== CACHE_VERSION) {
      return { version: CACHE_VERSION, items: {} };
    }

    return parsed;
  } catch (e) {
    console.warn('[TutorCache] Failed to load cache:', e);
    return { version: CACHE_VERSION, items: {} };
  }
}

function saveCache(data: CacheData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[TutorCache] Failed to save cache:', e);
    // If storage is full, try clearing old items and retry
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      try {
        pruneOldItems(data, Math.floor(MAX_ITEMS / 2));
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch {
        // Give up if still failing
      }
    }
  }
}

function isExpired(item: CacheItem): boolean {
  return Date.now() - item.createdAt > TTL_MS;
}

function pruneOldItems(data: CacheData, maxToKeep: number): void {
  const entries = Object.entries(data.items);
  if (entries.length <= maxToKeep) return;

  // Sort by createdAt ascending (oldest first)
  entries.sort((a, b) => a[1].createdAt - b[1].createdAt);

  // Keep only the newest maxToKeep items
  const toKeep = entries.slice(-maxToKeep);
  data.items = Object.fromEntries(toKeep);
}

function pruneExpiredItems(data: CacheData): void {
  const now = Date.now();
  for (const key of Object.keys(data.items)) {
    if (now - data.items[key].createdAt > TTL_MS) {
      delete data.items[key];
    }
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get cached text for a given key
 * Returns null if not found or expired
 */
export function getCachedText(cacheKey: string): string | null {
  const data = loadCache();
  const item = data.items[cacheKey];

  if (!item) {
    return null;
  }

  // Check TTL
  if (isExpired(item)) {
    // Remove expired item and save
    delete data.items[cacheKey];
    saveCache(data);
    console.log('[TutorCache] Expired:', cacheKey);
    return null;
  }

  console.log('[TutorCache] Hit:', cacheKey);
  return item.text;
}

/**
 * Set cached text for a given key
 * Automatically prunes old items if over MAX_ITEMS
 */
export function setCachedText(cacheKey: string, text: string): void {
  const data = loadCache();

  // First, prune expired items
  pruneExpiredItems(data);

  // Add new item
  data.items[cacheKey] = {
    text,
    createdAt: Date.now(),
  };

  // Check if over limit
  const itemCount = Object.keys(data.items).length;
  if (itemCount > MAX_ITEMS) {
    pruneOldItems(data, MAX_ITEMS);
  }

  saveCache(data);
  console.log('[TutorCache] Set:', cacheKey, `(${Object.keys(data.items).length} items)`);
}

/**
 * Clear all tutor cache
 */
export function clearTutorCache(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('[TutorCache] Cleared');
  } catch (e) {
    console.warn('[TutorCache] Failed to clear cache:', e);
  }
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats(): { itemCount: number; oldestAge: number; newestAge: number } {
  const data = loadCache();
  const items = Object.values(data.items);

  if (items.length === 0) {
    return { itemCount: 0, oldestAge: 0, newestAge: 0 };
  }

  const now = Date.now();
  const ages = items.map(item => now - item.createdAt);

  return {
    itemCount: items.length,
    oldestAge: Math.max(...ages),
    newestAge: Math.min(...ages),
  };
}
