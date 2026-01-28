'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import AdSlot from '@/components/AdSlot';
import { settings, FontSize } from '@/lib/settings';
import { useChat } from '@/hooks/useChat';
import { resetTutorProgressAndSession } from '@/lib/tutorApi';

// Dummy responses for non-authenticated users
const DUMMY_RESPONSES = [
  '좋아요! 그 목표를 달성하기 위한 첫 번째 단계는 무엇일까요?',
  '도전적인 목표네요! 구체적인 계획을 세워볼까요?',
  '잘하고 있어요! 이번 주 목표를 설정해 봅시다.',
  '그런 어려움이 있군요. 다른 방법을 시도해 볼까요?',
];

interface LocalMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

// Wrapper component to handle Suspense for useSearchParams
export default function CoachPage() {
  return (
    <Suspense fallback={<CoachPageLoading />}>
      <CoachPageContent />
    </Suspense>
  );
}

function CoachPageLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
    </div>
  );
}

function CoachPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');

  const [input, setInput] = useState('');
  const [fontSize, setFontSize] = useState<FontSize>('default');
  const [showWelcome, setShowWelcome] = useState(false);

  // For non-authenticated demo mode
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  const {
    messages: apiMessages,
    sending,
    isAuthenticated,
    sendMessage,
    currentSession,
    createNewSession,
    loadSession
  } = useChat({
    sessionType: 'coach',
    onError: (error) => console.error('Chat error:', error)
  });

  useEffect(() => {
    const appSettings = settings.getSettings();
    setFontSize(appSettings.fontSize);
  }, []);

  // Load session from URL parameter (coming from counsel page)
  useEffect(() => {
    if (sessionId && isAuthenticated) {
      const id = parseInt(sessionId, 10);
      if (!isNaN(id)) {
        loadSession(id);
        setShowWelcome(true);
      }
    }
  }, [sessionId, isAuthenticated, loadSession]);

  const fontSizeClass = settings.getFontSizeClass(fontSize);

  // Use API messages if authenticated, otherwise use local messages
  const messages = isAuthenticated ? apiMessages : localMessages;
  const loading = isAuthenticated ? sending : localLoading;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const content = input.trim();
    setInput('');
    setShowWelcome(false); // Hide welcome after first message

    if (isAuthenticated) {
      // If no current session, create one and redirect to /chat/[id]
      if (!currentSession) {
        try {
          const newSession = await createNewSession();
          if (newSession) {
            // Redirect to chat page with the first message
            router.push(`/chat/${newSession.id}?start=${encodeURIComponent(content)}`);
          }
        } catch (error) {
          console.error('Failed to create session:', error);
        }
      } else {
        // Session exists, send message normally
        await sendMessage(content);
      }
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

  const handleNewLesson = () => {
    const confirmed = window.confirm('새 레슨을 시작할까요? 현재 튜터링 진도가 초기화됩니다.');
    if (confirmed) {
      resetTutorProgressAndSession();
      router.push('/coach/tutor');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="코칭챗"
        showSettings
        settingsHref="/coach/settings"
        actions={
          <button
            onClick={handleNewLesson}
            className="text-sm px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            + 새 레슨
          </button>
        }
      />

      {/* Session Info (if authenticated) */}
      {isAuthenticated && currentSession && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500">
            세션: {currentSession.title || `레슨 #${currentSession.id}`}
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
        {messages.length === 0 && !showWelcome ? (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">코칭챗</h2>
              <p className="text-sm">목표 달성을 도와드릴게요</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Welcome message when coming from counsel */}
            {showWelcome && messages.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-gray-900 dark:text-white border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">코칭 모드</span>
                  </div>
                  <p className={`whitespace-pre-wrap ${fontSizeClass}`}>
                    좋아요! 지금부터는 코칭 모드로 진도를 시작할게요.
                    {'\n'}어떤 목표를 달성하고 싶으신가요?
                  </p>
                </div>
              </div>
            )}

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
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="목표나 고민을 말씀해 주세요..."
              disabled={loading}
              rows={1}
              className={`flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-gray-900 dark:text-white placeholder-gray-500 ${fontSizeClass}`}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
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
