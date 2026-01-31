'use client';

import { Understanding } from '@/types/tutor';

interface Props {
  value?: Understanding;
  onSelect: (value: Understanding) => void;
  disabled?: boolean;
}

const OPTIONS: { value: Understanding; emoji: string; label: string; description: string }[] = [
  {
    value: 'understood',
    emoji: '👍',
    label: '이해됐다',
    description: '설명 없이도 떠올릴 수 있어요',
  },
  {
    value: 'partial',
    emoji: '🤔',
    label: '조금 알겠어요',
    description: '다시 보면 정리될 것 같아요',
  },
  {
    value: 'not_yet',
    emoji: '🌱',
    label: '아직 어려워요',
    description: '연습이 필요해요',
  },
];

export default function UnderstandingSelector({ value, onSelect, disabled }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        지금 느낌에 가장 가까운 것을 골라주세요
      </p>

      <div className="grid grid-cols-1 gap-2">
        {OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              disabled={disabled}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="text-2xl">{option.emoji}</span>
              <div className="flex-1">
                <span className="font-medium">{option.label}</span>
                <span className="text-gray-500 ml-2">— {option.description}</span>
              </div>
              {isSelected && (
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
