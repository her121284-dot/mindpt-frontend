'use client';

interface Props {
  onRetry: () => void;
  message?: string;
}

/**
 * TutorErrorFallback - Friendly error display for tutor generation failures
 * Uses calm, non-alarming language to maintain user trust
 */
export default function TutorErrorFallback({ onRetry, message }: Props) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {message || '잠시 생각을 정리하고 있어요.'}
          </p>
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    </div>
  );
}
