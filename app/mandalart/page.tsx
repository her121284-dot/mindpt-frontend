'use client';

import PageHeader from '@/components/PageHeader';

export default function MandalartPage() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader title="만다라트" />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">만다라트</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              목표를 시각적으로 정리하고 실행 계획을 세워보세요.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-4">
              서비스 준비 중입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
