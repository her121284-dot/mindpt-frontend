'use client';

import PageHeader from '@/components/PageHeader';

const FEATURES = [
  { icon: '💬', name: '상담챗', desc: 'AI 상담사와 마음 편하게 대화할 수 있습니다.' },
  { icon: '📚', name: '마음훈련 레슨', desc: 'OT → U → L → C 순서로 마음 훈련을 진행합니다.' },
  { icon: '📢', name: '잔소리챗', desc: '동기부여와 잔소리로 실천을 돕습니다.' },
  { icon: '🎯', name: '만다라트', desc: '목표를 시각적으로 정리하고 실행 계획을 세웁니다.' },
  { icon: '☕', name: '네이버 카페', desc: '다른 사용자와 경험을 공유하고 소통합니다.' },
  { icon: '🛍️', name: '마인드피티 몰', desc: '마음훈련 관련 상품을 만나보세요. (서비스 예정)' },
];

export default function GuidePage() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader title="마인드피티 사용법" />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Purpose */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6 text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              마인드피티는 마음을 훈련하여 온전한 삶을 만드는 플랫폼입니다.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f.name} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{f.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Lesson Order */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">마음훈련 순서</h3>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="px-3 py-1 bg-green-200 dark:bg-green-800 rounded-full font-medium">OT</span>
              <span>→</span>
              <span className="px-3 py-1 bg-green-200 dark:bg-green-800 rounded-full font-medium">U</span>
              <span>→</span>
              <span className="px-3 py-1 bg-green-200 dark:bg-green-800 rounded-full font-medium">L</span>
              <span>→</span>
              <span className="px-3 py-1 bg-green-200 dark:bg-green-800 rounded-full font-medium">C</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              각 시리즈를 순서대로 완료해야 다음 시리즈가 열립니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
