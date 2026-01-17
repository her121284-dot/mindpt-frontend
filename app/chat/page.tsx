'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Session, Message } from '@/lib/api';
import { auth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';

export default function ChatPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const newSession = await api.createSession('New Conversation');
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
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
  };

  // Send message
  const handleSendMessage = async (content: string) => {
    try {
      // Create a new session if none exists
      if (!currentSessionId) {
        setLoading(true);
        const newSession = await api.createSession('New Conversation');
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
        id: Date.now(), // temporary ID
        user_id: 0, // will be set by server
        session_id: sessionId,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };
      setMessages([...messages, optimisticUserMessage]);

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
      const timer = setTimeout(() => setError(null), 30000); // 30초로 변경
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="flex h-screen">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onLogout={handleLogout}
        loading={loading}
      />
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={loading}
      />

      {/* Error Notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
