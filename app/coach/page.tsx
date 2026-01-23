'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import AdSlot from '@/components/AdSlot';
import { settings, FontSize } from '@/lib/settings';
import { useChat } from '@/hooks/useChat';
import { EXTERNAL_URLS, HOMEWORK_TEMPLATE, STORAGE_KEYS } from '@/lib/constants';

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
  const sessionId = searchParams.get('session');

  const [input, setInput] = useState('');
  const [fontSize, setFontSize] = useState<FontSize>('default');
  const [showWelcome, setShowWelcome] = useState(false);
  const [homeworkDone, setHomeworkDone] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Load homework completion status from localStorage
  useEffect(() => {
    if (currentSession?.id) {
      const key = `${STORAGE_KEYS.HOMEWORK_DONE_PREFIX}${currentSession.id}`;
      const done = localStorage.getItem(key) === 'true';
      setHomeworkDone(done);
    }
  }, [currentSession?.id]);

  // Handle cafe link click (new tab)
  const handleGoToCafe = () => {
    window.open(EXTERNAL_URLS.NAVER_CAFE, '_blank', 'noopener,noreferrer');
  };

  // Handle template copy to clipboard
  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(HOMEWORK_TEMPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy template:', error);
    }
  };

  // Handle homework completion
  const handleHomeworkDone = () => {
    if (currentSession?.id) {
      const key = `${STORAGE_KEYS.HOMEWORK_DONE_PREFIX}${currentSession.id}`;
      localStorage.setItem(key, 'true');
      setHomeworkDone(true);
    } else {
      // Demo mode - just toggle state
      setHomeworkDone(true);
    }
  };

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

  const handleNewLesson = async () => {
    setShowWelcome(false);
    if (isAuthenticated) {
      await createNewSession();
    } else {
      setLocalMessages([]);
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
        {/* Homework Card */}
        {!homeworkDone && (
          <div className="max-w-3xl mx-auto px-4 pt-4">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">오늘의 숙제</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    듣기만 하면 변화가 없어요. 오늘은 글쓰기로 연습해볼까요?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleGoToCafe}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      카페 글쓰기
                    </button>
                    <button
                      onClick={handleCopyTemplate}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                        copied
                          ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          복사됨!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          템플릿 복사
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleHomeworkDone}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-800 dark:hover:bg-amber-700 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      완료했어요
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
