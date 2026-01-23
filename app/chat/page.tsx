'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Session, Message } from '@/lib/api';
import { auth } from '@/lib/auth';
import ChatWindow from '@/components/ChatWindow';
import SessionDrawer from '@/components/SessionDrawer';

export default function ChatPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    } else {
      loadSessions();
    }
  }, [router]);

  // Load sessions
  const loadSessions = async () => {
    try {
      const sessionsData = await api.getSessions();
      setSessions(sessionsData);

      // Auto-select first session if available
      if (sessionsData.length > 0 && !currentSessionId) {
        setCurrentSessionId(sessionsData[0].id);
        loadMessages(sessionsData[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load sessions:', err);
      setError(err.message);
    }
  };

  // Load messages for a session
  const loadMessages = async (sessionId: number) => {
    try {
      setLoading(true);
      const messagesData = await api.getSessionMessages(sessionId);
      setMessages(messagesData);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new chat session
  const handleNewChat = async () => {
    try {
      setLoading(true);
      const newSession = await api.createSession({ title: '새 대화', type: 'counsel' });
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      setDrawerOpen(false);
    } catch (err: any) {
      console.error('Failed to create session:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Select a session
  const handleSelectSession = (sessionId: number) => {
    setCurrentSessionId(sessionId);
    loadMessages(sessionId);
    setDrawerOpen(false);
  };

  // Send message
  const handleSendMessage = async (content: string) => {
    try {
      // Create a new session if none exists
      if (!currentSessionId) {
        setLoading(true);
        const newSession = await api.createSession({ title: '새 대화', type: 'counsel' });
        setSessions([newSession, ...sessions]);
        setCurrentSessionId(newSession.id);
        setLoading(false);

        // Now send the message to the new session
        await sendMessageToSession(newSession.id, content);
        return;
      }

      await sendMessageToSession(currentSessionId, content);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Helper function to send message to a specific session
  const sendMessageToSession = async (sessionId: number, content: string) => {
    try {
      setLoading(true);

      // Optimistic UI update - add user message immediately
      const optimisticUserMessage: Message = {
        id: Date.now(),
        user_id: 0,
        session_id: sessionId,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMessage]);

      // Send to API
      await api.sendMessage(sessionId, content);

      // Reload messages to get actual IDs and AI response
      await loadMessages(sessionId);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message);
      // Reload messages to remove optimistic update on error
      if (sessionId) {
        await loadMessages(sessionId);
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    auth.removeToken();
    router.push('/login');
  };

  // Show error notification
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 30000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            MINDPT
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* + 새로운 채팅 버튼 */}
          <button
            onClick={handleNewChat}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>새로운 채팅</span>
          </button>

          {/* 채팅 목록 버튼 */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>채팅 목록</span>
          </button>

          {/* 로그아웃 버튼 */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="로그아웃"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
        />
      </div>

      {/* 오른쪽 드로어 */}
      <SessionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
      />

      {/* Error Notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
