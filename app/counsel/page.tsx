'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import AdSlot from '@/components/AdSlot';
import { settings, FontSize } from '@/lib/settings';
import { useChat } from '@/hooks/useChat';
import { api } from '@/lib/api';

// Dummy responses for non-authenticated users
const DUMMY_RESPONSES = [
  '지금 느끼시는 감정에 대해 더 이야기해 주시겠어요?',
  '그런 상황에서 힘드셨겠네요. 지금 기분이 어떠세요?',
  '말씀해 주셔서 감사합니다. 함께 방법을 찾아볼게요.',
  '그런 생각이 드실 때가 있으시군요. 충분히 이해할 수 있어요.',
];

interface LocalMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function CounselPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [fontSize, setFontSize] = useState<FontSize>('default');
  const [showCoachCTA, setShowCoachCTA] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  // For non-authenticated demo mode
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  const {
    messages: apiMessages,
    sending,
    isAuthenticated,
    sendMessage,
    currentSession,
    createNewSession
  } = useChat({
    sessionType: 'counsel',
    onError: (error) => console.error('Chat error:', error)
  });

  useEffect(() => {
    const appSettings = settings.getSettings();
    setFontSize(appSettings.fontSize);
  }, []);

  const fontSizeClass = settings.getFontSizeClass(fontSize);

  // Use API messages if authenticated, otherwise use local messages
  const messages = isAuthenticated ? apiMessages : localMessages;
  const loading = isAuthenticated ? sending : localLoading;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const content = input.trim();
    setInput('');

    if (isAuthenticated) {
      // Use real API
      await sendMessage(content);
    } else {
      // Demo mode with dummy responses
      const userMessage: LocalMessage = {
        id: Date.now(),
        role: 'user',
        content,
      };
      setLocalMessages(prev => [...prev, userMessage]);
      setLocalLoading(true);

      setTimeout(() => {
        const aiMessage: LocalMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)],
        };
        setLocalMessages(prev => [...prev, aiMessage]);
        setLocalLoading(false);
      }, 1200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    if (isAuthenticated) {
      await createNewSession();
    } else {
      setLocalMessages([]);
    }
  };

  // 코칭으로 전환
  const handleGoToCoaching = async () => {
    setTransitioning(true);
    try {
      if (isAuthenticated) {
        // Create a new coach session
        const newSession = await api.createSession({
          title: '코칭 시작',
          type: 'coach'
        });
        // Navigate to coach page with session id
        router.push(`/coach?session=${newSession.id}`);
      } else {
        // Demo mode - just navigate
        router.push('/coach');
      }
    } catch (error) {
      console.error('Failed to create coach session:', error);
      setTransitioning(false);
    }
  };

  // CTA 숨기기
  const handleDismissCTA = () => {
    setShowCoachCTA(false);
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="상담챗"
        showSettings
        settingsHref="/counsel/settings"
        actions={
          <button
            onClick={handleNewChat}
            className="text-sm px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
          >
            + 새 상담
          </button>
        }
      />

      {/* Session Info (if authenticated) */}
      {isAuthenticated && currentSession && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500">
            세션: {currentSession.title || `상담 #${currentSession.id}`}
          </p>
        </div>
      )}

      {/* Demo Mode Notice */}
      {!isAuthenticated && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            데모 모드 - 로그인하면 대화가 저장됩니다
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">상담챗</h2>
              <p className="text-sm">마음 편하게 이야기해 주세요</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${fontSizeClass} ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        {/* 코칭 전환 CTA */}
        {showCoachCTA && (
          <div className="max-w-3xl mx-auto px-4 pt-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    듣기만 하면 변화가 없어요. 코칭으로 연습을 시작해볼까요?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleGoToCoaching}
                      disabled={transitioning}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      {transitioning ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          이동 중...
                        </>
                      ) : (
                        <>
                          코칭으로 넘어가기
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDismissCTA}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                    >
                      오늘은 상담만
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="마음을 편하게 이야기해 주세요..."
              disabled={loading}
              rows={1}
              className={`flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 text-gray-900 dark:text-white placeholder-gray-500 ${fontSizeClass}`}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Ad Slot */}
        <div className="px-4 pb-4">
          <div className="max-w-3xl mx-auto">
            <AdSlot />
          </div>
        </div>
      </div>
    </div>
  );
}
