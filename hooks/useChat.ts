'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, Session, Message, SessionType } from '@/lib/api';
import { auth } from '@/lib/auth';

interface UseChatOptions {
  sessionType: SessionType;
  onError?: (error: Error) => void;
}

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  currentSession: Session | null;
  sessions: Session[];
  isAuthenticated: boolean;
  sendMessage: (content: string) => Promise<void>;
  createNewSession: (title?: string) => Promise<Session | null>;
  loadSession: (sessionId: number) => Promise<void>;
  loadSessions: () => Promise<void>;
}

export function useChat({ sessionType, onError }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = auth.getToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  // Load sessions for this type
  const loadSessions = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await api.getSessions(sessionType);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      onError?.(error as Error);
    }
  }, [isAuthenticated, sessionType, onError]);

  // Load a specific session and its messages
  const loadSession = useCallback(async (sessionId: number) => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const [session, sessionMessages] = await Promise.all([
        api.getSession(sessionId),
        api.getSessionMessages(sessionId)
      ]);
      setCurrentSession(session);
      setMessages(sessionMessages);
    } catch (error) {
      console.error('Failed to load session:', error);
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, onError]);

  // Create a new session
  const createNewSession = useCallback(async (title?: string): Promise<Session | null> => {
    if (!isAuthenticated) return null;

    try {
      const session = await api.createSession({
        title: title || getDefaultTitle(sessionType),
        type: sessionType
      });
      setCurrentSession(session);
      setMessages([]);
      setSessions(prev => [session, ...prev]);
      return session;
    } catch (error) {
      console.error('Failed to create session:', error);
      onError?.(error as Error);
      return null;
    }
  }, [isAuthenticated, sessionType, onError]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!isAuthenticated || sending) return;

    setSending(true);

    try {
      // Create session if none exists
      let session = currentSession;
      if (!session) {
        session = await createNewSession();
        if (!session) {
          throw new Error('Failed to create session');
        }
      }

      // Optimistically add user message
      const tempUserMessage: Message = {
        id: Date.now(),
        user_id: 0,
        session_id: session.id,
        role: 'user',
        content,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // Send to API and get AI response
      const response = await api.sendMessage(session.id, content);

      // Replace temp message with real one and add AI response
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMessage.id);
        return [
          ...filtered,
          {
            id: response.user_message_id,
            user_id: 0,
            session_id: session!.id,
            role: 'user' as const,
            content,
            created_at: new Date().toISOString()
          },
          {
            id: response.assistant_message_id,
            user_id: 0,
            session_id: session!.id,
            role: 'assistant' as const,
            content: response.assistant_content,
            created_at: new Date().toISOString()
          }
        ];
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      onError?.(error as Error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== Date.now()));
    } finally {
      setSending(false);
    }
  }, [isAuthenticated, sending, currentSession, createNewSession, onError]);

  return {
    messages,
    loading,
    sending,
    currentSession,
    sessions,
    isAuthenticated,
    sendMessage,
    createNewSession,
    loadSession,
    loadSessions
  };
}

function getDefaultTitle(type: SessionType): string {
  switch (type) {
    case 'counsel':
      return '새 상담';
    case 'coach':
      return '새 레슨';
    case 'nag':
      return '새 잔소리';
  }
}
