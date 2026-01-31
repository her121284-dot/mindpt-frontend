/**
 * Tutor Generate API - One-shot AI content generation
 * Calls /tutor/generate endpoint for explain/summary/homework/understanding_question
 */

import { auth } from './auth';
import { Understanding } from '@/types/tutor';
import { DEV_SKIP_TUTOR_AUTH } from './tutorApi';

export type { Understanding };

const API_BASE_URL = '/api/proxy';

// ============================================================================
// Types
// ============================================================================

export type GenerateType = 'explain' | 'summary' | 'homework' | 'understanding_question' | 'render_block';

export interface TutorGenerateRequest {
  type: GenerateType;
  series_id: string;
  lesson_id: string;
  chunk_index: number;
  user_input?: string;
  understanding?: Understanding; // For homework generation
}

export interface TutorGenerateResponse {
  type: GenerateType;
  content: string;
  lesson_id: string;
  chunk_index: number;
}

export interface TutorGenerateError {
  message: string;
  status?: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Generate tutor content (explain/summary/homework/understanding_question)
 * One-shot AI generation without session storage
 */
export async function generateTutorContent(
  request: TutorGenerateRequest
): Promise<TutorGenerateResponse> {
  const token = auth.getToken();

  // DEV mode: skip auth check
  if (!DEV_SKIP_TUTOR_AUTH && !token) {
    throw {
      message: '로그인이 필요합니다.',
      status: 401,
    } as TutorGenerateError;
  }

  const url = `${API_BASE_URL}/tutor/generate`;

  try {
    console.log('[TutorGenerateAPI] Generating:', request.type, request.lesson_id);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Only add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = `AI 생성 실패: ${response.status}`;

      try {
        const errorText = await response.text();
        console.error('[TutorGenerateAPI] Error:', response.status, errorText);

        // Try to parse JSON error response
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.detail) {
            errorMessage = String(errorJson.detail);
          } else if (errorJson.message) {
            errorMessage = String(errorJson.message);
          }
        } catch {
          // Not JSON, use text directly if short enough
          if (errorText && errorText.length < 200) {
            errorMessage = errorText;
          }
        }
      } catch (e) {
        console.error('[TutorGenerateAPI] Failed to read error response:', e);
      }

      throw {
        message: errorMessage,
        status: response.status,
      } as TutorGenerateError;
    }

    const data = await response.json();
    console.log('[TutorGenerateAPI] Generated:', data.type, data.lesson_id);

    return data as TutorGenerateResponse;
  } catch (err) {
    if ((err as TutorGenerateError).status) {
      throw err;
    }

    console.error('[TutorGenerateAPI] Network error:', err);
    throw {
      message: '네트워크 오류가 발생했습니다.',
    } as TutorGenerateError;
  }
}

/**
 * Generate explanation for current lesson content
 */
export async function generateExplanation(
  seriesId: string,
  lessonId: string,
  chunkIndex: number,
  userQuestion?: string
): Promise<string> {
  const response = await generateTutorContent({
    type: 'explain',
    series_id: seriesId,
    lesson_id: lessonId,
    chunk_index: chunkIndex,
    user_input: userQuestion,
  });
  return response.content;
}

/**
 * Generate summary of lesson content so far
 */
export async function generateSummary(
  seriesId: string,
  lessonId: string,
  chunkIndex: number
): Promise<string> {
  const response = await generateTutorContent({
    type: 'summary',
    series_id: seriesId,
    lesson_id: lessonId,
    chunk_index: chunkIndex,
  });
  return response.content;
}

/**
 * Generate homework suggestion based on lesson and understanding level
 * @param understanding - User's self-assessed comprehension level (required)
 */
export async function generateHomework(
  seriesId: string,
  lessonId: string,
  chunkIndex: number,
  understanding: Understanding
): Promise<string> {
  const response = await generateTutorContent({
    type: 'homework',
    series_id: seriesId,
    lesson_id: lessonId,
    chunk_index: chunkIndex,
    understanding,
  });
  return response.content;
}

/**
 * Generate understanding question for the lesson
 */
export async function generateUnderstandingQuestion(
  seriesId: string,
  lessonId: string,
  chunkIndex: number
): Promise<string> {
  const response = await generateTutorContent({
    type: 'understanding_question',
    series_id: seriesId,
    lesson_id: lessonId,
    chunk_index: chunkIndex,
  });
  return response.content;
}

/**
 * Generate readable block from raw lesson content
 * Restructures the paragraph into a more readable format
 * @param blockIndex - 0-based index of the paragraph to render
 */
export async function generateRenderBlock(
  seriesId: string,
  lessonId: string,
  blockIndex: number
): Promise<string> {
  const response = await generateTutorContent({
    type: 'render_block',
    series_id: seriesId,
    lesson_id: lessonId,
    chunk_index: blockIndex,
  });
  return response.content;
}
