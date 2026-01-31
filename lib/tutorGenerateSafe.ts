/**
 * Tutor Generate Safe Wrapper - Retry/Backoff for reliability
 * Wraps generate functions with automatic retry on failure
 */

import { log } from './logger';
import {
  generateExplanation,
  generateSummary,
  generateHomework,
  generateUnderstandingQuestion,
  generateRenderBlock,
  Understanding,
} from './tutorGenerateApi';

const MAX_RETRY = 3;
const BASE_DELAY = 400; // ms

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generic retry wrapper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  context: string,
  retryCount = 0
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retryCount >= MAX_RETRY) {
      log.error(`[TutorGenerate][FAIL] ${context} after ${MAX_RETRY} retries`, err);
      throw err;
    }

    const delay = BASE_DELAY * Math.pow(2, retryCount);
    log.info(`[TutorGenerate][RETRY] ${context} attempt ${retryCount + 1}/${MAX_RETRY}, waiting ${delay}ms`);

    await sleep(delay);
    return withRetry(fn, context, retryCount + 1);
  }
}

/**
 * Safe explanation generation with retry
 */
export async function safeGenerateExplanation(
  seriesId: string,
  lessonId: string,
  chunkIndex: number,
  userQuestion?: string
): Promise<string> {
  return withRetry(
    () => generateExplanation(seriesId, lessonId, chunkIndex, userQuestion),
    `explain:${seriesId}:${lessonId}:${chunkIndex}`
  );
}

/**
 * Safe summary generation with retry
 */
export async function safeGenerateSummary(
  seriesId: string,
  lessonId: string,
  chunkIndex: number
): Promise<string> {
  return withRetry(
    () => generateSummary(seriesId, lessonId, chunkIndex),
    `summary:${seriesId}:${lessonId}`
  );
}

/**
 * Safe homework generation with retry
 */
export async function safeGenerateHomework(
  seriesId: string,
  lessonId: string,
  chunkIndex: number,
  understanding: Understanding
): Promise<string> {
  return withRetry(
    () => generateHomework(seriesId, lessonId, chunkIndex, understanding),
    `homework:${seriesId}:${lessonId}:${understanding}`
  );
}

/**
 * Safe understanding question generation with retry
 */
export async function safeGenerateUnderstandingQuestion(
  seriesId: string,
  lessonId: string,
  chunkIndex: number
): Promise<string> {
  return withRetry(
    () => generateUnderstandingQuestion(seriesId, lessonId, chunkIndex),
    `uq:${seriesId}:${lessonId}`
  );
}

/**
 * Safe render block generation with retry
 * Generates readable blocks from raw paragraph content
 */
export async function safeGenerateRenderBlock(
  seriesId: string,
  lessonId: string,
  blockIndex: number
): Promise<string> {
  return withRetry(
    () => generateRenderBlock(seriesId, lessonId, blockIndex),
    `render_block:${seriesId}:${lessonId}:${blockIndex}`
  );
}
