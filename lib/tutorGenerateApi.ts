/**
 * Tutor Generate API - One-shot AI content generation
 * Calls /tutor/generate endpoint for explain/summary/homework/understanding_question
 */

import { auth } from './auth';

const API_BASE_URL = '/api/proxy';

// ============================================================================
// Types
// ============================================================================

export type GenerateType = 'explain' | 'summary' | 'homework' | 'understanding_question';

export interface TutorGenerateRequest {
  type: GenerateType;
  series_id: string;
  lesson_id: string;
  chunk_index: number;
  user_input?: string;
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

  if (!token) {
    throw {
      message: '로그인이 필요합니다.',
      status: 401,
    } as TutorGenerateError;
  }

  const url = `${API_BASE_URL}/tutor/generate`;

  try {
    console.log('[TutorGenerateAPI] Generating:', request.type, request.lesson_id);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TutorGenerateAPI] Error:', response.status, errorText);

      throw {
        message: `AI 생성 실패: ${response.status}`,
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
 * Generate homework suggestion based on lesson
 */
export async function generateHomework(
  seriesId: string,
  lessonId: string,
  chunkIndex: number
): Promise<string> {
  const response = await generateTutorContent({
    type: 'homework',
    series_id: seriesId,
    lesson_id: lessonId,
    chunk_index: chunkIndex,
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
