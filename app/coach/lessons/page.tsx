'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';

interface Lesson {
  id: number;
  title: string;
  date: string;
  status: 'completed' | 'in_progress' | 'not_started';
  progress: number;
}

// 더미 데이터
const initialLessons: Lesson[] = [
  { id: 1, title: '목표 설정의 기초', date: '2024-01-20', status: 'completed', progress: 100 },
  { id: 2, title: '시간 관리 마스터하기', date: '2024-01-19', status: 'completed', progress: 100 },
  { id: 3, title: '습관 형성의 과학', date: '2024-01-18', status: 'in_progress', progress: 60 },
  { id: 4, title: '동기부여 유지하기', date: '2024-01-17', status: 'not_started', progress: 0 },
  { id: 5, title: '스트레스 관리', date: '2024-01-16', status: 'not_started', progress: 0 },
];

export default function CoachLessonsPage() {
  const [lessons] = useState<Lesson[]>(initialLessons);

  const getStatusBadge = (status: Lesson['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            완료
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
            진행중
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full">
            시작 전
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="레슨 목록" />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {lessons.filter(l => l.status === 'completed').length}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">완료</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {lessons.filter(l => l.status === 'in_progress').length}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">진행중</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {lessons.filter(l => l.status === 'not_started').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">대기중</p>
            </div>
          </div>

          {/* 레슨 목록 */}
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {lesson.date}
                    </p>
                  </div>
                  {getStatusBadge(lesson.status)}
                </div>

                {/* 진행률 바 */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      lesson.status === 'completed'
                        ? 'bg-green-500'
                        : lesson.status === 'in_progress'
                        ? 'bg-blue-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    style={{ width: `${lesson.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                  {lesson.progress}% 완료
                </p>
              </div>
            ))}
          </div>

          {/* 안내 문구 */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              * 현재 UI 데모 버전입니다. 실제 레슨 기능은 추후 연동 예정입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
