'use client';

import { useEffect } from 'react';
import { Session } from '@/lib/api';

interface SessionDrawerProps {
  open: boolean;
  onClose: () => void;
  sessions: Session[];
  activeSessionId: number | null;
  onSelectSession: (id: number) => void;
}

export default function SessionDrawer({
  open,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
}: SessionDrawerProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // 바디 스크롤 방지
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSelect = (id: number) => {
    onSelectSession(id);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* 패널 */}
      <div className="absolute top-0 right-0 h-full w-[360px] max-w-[90vw] bg-white dark:bg-gray-900 shadow-xl flex flex-col animate-slide-in-right">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            채팅 목록
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 세션 목록 */}
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
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
              <p className="text-sm">대화 내역이 없습니다</p>
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSelect(session.id)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                  activeSessionId === session.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 ${
                      activeSessionId === session.id
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`truncate font-medium ${
                        activeSessionId === session.id
                          ? 'text-indigo-900 dark:text-indigo-100'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {session.title || '새 대화'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(session.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
