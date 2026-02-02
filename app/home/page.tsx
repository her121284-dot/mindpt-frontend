'use client';

import PageHeader from '@/components/PageHeader';

const NOTICES = [
  { id: 1, title: '마인드피티 오픈 안내', date: '2026.02.01', badge: '공지' },
  { id: 2, title: '마음훈련 레슨 OT~C 시리즈 업데이트', date: '2026.01.30', badge: '업데이트' },
  { id: 3, title: '잔소리챗 기능 추가 안내', date: '2026.01.28', badge: '업데이트' },
];

export default function HomePage() {
  return (
    <div className="h-full flex flex-col">
      <PageHeader title="MINDPT" />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Welcome */}
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              마인드피티에 오신 것을 환영합니다
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              마음을 훈련하고, 온전한 삶을 만들어가는 플랫폼
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="/guide" className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
              <span className="text-2xl">📖</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">사용법 보기</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">마인드피티 활용 가이드</p>
              </div>
            </a>
            <a href="/counsel" className="flex items-center gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors">
              <span className="text-2xl">💬</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">상담챗 시작</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">마음 편하게 이야기하기</p>
              </div>
            </a>
          </div>

          {/* Notices */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">공지사항</h3>
            <div className="space-y-2">
              {NOTICES.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      n.badge === '공지'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      {n.badge}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white truncate">{n.title}</span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{n.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
