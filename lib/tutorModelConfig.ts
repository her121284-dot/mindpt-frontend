/**
 * Tutor Model Configuration
 * Defines model and temperature settings for each generation type
 * Used by backend /tutor/generate endpoint
 */

export type TutorGenerateType = 'explain' | 'summary' | 'understanding_question' | 'homework';

export interface ModelConfig {
  model: string;
  temperature: number;
}

/**
 * Model configuration per generation type
 * - explain: Slightly creative for engaging explanations
 * - summary: More deterministic for accurate summaries
 * - understanding_question: Moderate creativity for thought-provoking questions
 * - homework: Higher creativity for personalized practice suggestions
 */
export const TUTOR_MODEL_CONFIG: Record<TutorGenerateType, ModelConfig> = {
  explain: {
    model: 'gpt-4.1-mini',
    temperature: 0.4,
  },
  summary: {
    model: 'gpt-4.1-mini',
    temperature: 0.3,
  },
  understanding_question: {
    model: 'gpt-4.1-mini',
    temperature: 0.5,
  },
  homework: {
    model: 'gpt-4.1-mini',
    temperature: 0.6,
  },
};

/**
 * Get model config for a generation type
 */
export function getModelConfig(type: TutorGenerateType): ModelConfig {
  return TUTOR_MODEL_CONFIG[type];
}
