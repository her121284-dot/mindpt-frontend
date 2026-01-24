'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Session } from '@/lib/api';
import { auth } from '@/lib/auth';
import PageHeader from '@/components/PageHeader';

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is logged in
        const token = auth.getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch sessions from backend
        const data = await api.getSessions();
        setSessions(data || []);
      } catch (err: any) {
        console.error('[Conversations] Failed to load sessions:', err);
        setError(err.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'counsel':
        return '상담챗';
      case 'coach':
        return '코칭챗';
      case 'nag':
        return '잔소리챗';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'counsel':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'coach':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'nag':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="채팅 목록" />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                대화 목록을 불러오는 중...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Sessions List */}
          {!loading && !error && (
            <>
              {sessions.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    저장된 대화가 없습니다
                  </p>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    새 대화 시작하기
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => router.push(`/chat/${session.id}`)}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {session.title || '제목 없는 대화'}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                                session.type
                              )}`}
                            >
                              {getTypeLabel(session.type)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                            <span>세션 ID: {session.id}</span>
                            <span>•</span>
                            <span>{formatDate(session.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-gray-400 dark:text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
