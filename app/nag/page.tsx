'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import AdSlot from '@/components/AdSlot';
import { settings, FontSize } from '@/lib/settings';
import { useChat } from '@/hooks/useChat';

// Dummy responses for non-authenticated users
const DUMMY_RESPONSES = [
  '또 미루고 있는 거야? 빨리 시작해!',
  '그거 오늘 안 하면 내일 더 힘들어질 거야~',
  '아직도 안 했어? 지금 바로 해!',
  '핑계 대지 말고 일단 시작해봐!',
  '5분만 해보자. 시작이 반이야!',
];

interface LocalMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function NagPage() {
  const [input, setInput] = useState('');
  const [fontSize, setFontSize] = useState<FontSize>('default');

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
    sessionType: 'nag',
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
      }, 800);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewNag = async () => {
    if (isAuthenticated) {
      await createNewSession();
    } else {
      setLocalMessages([]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="잔소리챗"
        actions={
          <button
            onClick={handleNewNag}
            className="text-sm px-3 py-1 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
          >
            + 새 잔소리
          </button>
        }
      />

      {/* Session Info (if authenticated) */}
      {isAuthenticated && currentSession && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500">
            세션: {currentSession.title || `잔소리 #${currentSession.id}`}
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
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">잔소리챗</h2>
              <p className="text-sm">할 일을 미루고 있다면 말해보세요!</p>
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
                      : 'bg-orange-100 dark:bg-orange-900/50 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-orange-100 dark:bg-orange-900/50 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
              placeholder="미루고 있는 일을 말해보세요..."
              disabled={loading}
              rows={1}
              className={`flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 text-gray-900 dark:text-white placeholder-gray-500 ${fontSizeClass}`}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
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
