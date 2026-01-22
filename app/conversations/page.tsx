'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';

interface ChatSession {
  id: number;
  title: string;
  createdAt: string;
  lastMessage: string;
}

// 더미 데이터
const initialSessions: ChatSession[] = [
  { id: 1, title: '스트레스 관리에 대한 상담', createdAt: '2024-01-20', lastMessage: '명상을 시작해보세요...' },
  { id: 2, title: '업무 목표 설정', createdAt: '2024-01-19', lastMessage: '구체적인 목표를 세우면...' },
  { id: 3, title: '수면 패턴 개선', createdAt: '2024-01-18', lastMessage: '규칙적인 수면 시간이...' },
  { id: 4, title: '대인관계 고민', createdAt: '2024-01-17', lastMessage: '상대방의 입장에서...' },
  { id: 5, title: '자기개발 계획', createdAt: '2024-01-16', lastMessage: '작은 목표부터 시작...' },
];

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = (id: number) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: editTitle.trim() } : s))
    );
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = (id: number) => {
    if (confirm('이 대화를 삭제하시겠습니까?')) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader title="채팅 목록" />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>저장된 대화가 없습니다</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {editingId === session.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, session.id)}
                        onBlur={() => handleSaveEdit(session.id)}
                        autoFocus
                        className="w-full px-2 py-1 border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white dark:bg-gray-700"
                      />
                    ) : (
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {session.title}
                      </h3>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                      {session.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {session.createdAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {editingId === session.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(session.id)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="저장"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="취소"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(session)}
                          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="제목 수정"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
