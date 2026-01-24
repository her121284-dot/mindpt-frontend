'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api, Message } from '@/lib/api';
import { auth } from '@/lib/auth';
import ChatWindow from '@/components/ChatWindow';
import PageHeader from '@/components/PageHeader';

export default function ChatSessionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params?.id as string;
  const startMessage = searchParams.get('start');

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const startMessageSent = useRef(false);

  // Load session and messages
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) return;

      try {
        setInitialLoading(true);
        setError(null);

        // Check if user is logged in
        const token = auth.getToken();
        if (!token) {
          router.push('/login');
          return;
        }

        // Load session details
        const session = await api.getSession(parseInt(sessionId));
        setSessionTitle(session.title || '제목 없는 대화');

        // Load messages
        const msgs = await api.getSessionMessages(parseInt(sessionId));
        setMessages(msgs || []);
      } catch (err: any) {
        console.error('[ChatSession] Failed to load session:', err);
        setError(err.message || 'Failed to load session');
      } finally {
        setInitialLoading(false);
      }
    };

    loadSession();
  }, [sessionId, router]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);

      // Send message and get AI response
      await api.sendMessage(parseInt(sessionId), content);

      // Reload messages to get the latest state
      const updatedMessages = await api.getSessionMessages(parseInt(sessionId));
      setMessages(updatedMessages || []);
    } catch (err: any) {
      console.error('[ChatSession] Failed to send message:', err);
      setError(err.message || 'Failed to send message');
      throw err; // Re-throw to let ChatWindow handle it
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Auto-send start message if present (only once)
  useEffect(() => {
    const sendStartMessage = async () => {
      if (!startMessage || startMessageSent.current || initialLoading) return;

      startMessageSent.current = true;

      // Remove 'start' query param from URL
      router.replace(`/chat/${sessionId}`);

      // Send the first message
      try {
        await handleSendMessage(startMessage);
      } catch (error) {
        console.error('[ChatSession] Failed to send start message:', error);
      }
    };

    sendStartMessage();
  }, [startMessage, initialLoading, sessionId, router, handleSendMessage]);

  if (initialLoading) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader title="대화 불러오는 중..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              대화를 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader title="오류" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
              <button
                onClick={() => router.push('/conversations')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                대화 목록으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={sessionTitle}
        subtitle={`세션 ID: ${sessionId}`}
      />
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          loading={loading}
        />
      </div>
    </div>
  );
}
