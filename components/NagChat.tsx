'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { settings, FontSize } from '@/lib/settings';
import { useChat } from '@/hooks/useChat';

// Dummy responses for non-authenticated users
const DUMMY_RESPONSES: Record<string, string[]> = {
  morning: [
    '좋은 아침! 오늘 아침 루틴 시작해볼까?',
    '일어났으면 물 한 잔부터! 바로 해봐!',
    '스트레칭 5분이면 하루가 달라져. 시작!',
  ],
  evening: [
    '오늘 하루 어땠어? 솔직하게 말해봐.',
    '감정을 정리하는 건 중요해. 뭐가 힘들었어?',
    '좋았던 일도 있었을 거야. 떠올려봐!',
  ],
  running: [
    '오늘 뛰기로 했잖아! 핑계 대지 마!',
    '운동화 신기만 하면 반은 성공이야!',
    '10분만 뛰어도 기분 좋아질 거야. 일단 나가!',
  ],
  mandalart: [
    '만다라트 목표 점검 시간이야!',
    '오늘 어떤 세부 목표를 실천했어?',
    '작은 실천이 큰 변화를 만들어. 하나만 골라봐!',
  ],
};

const MODE_TITLES: Record<string, string> = {
  morning: '아침루틴 잔소리',
  evening: '저녁 감정 체크',
  running: '러닝 잔소리',
  mandalart: '만다라트 잔소리',
};

const MODE_PLACEHOLDERS: Record<string, string> = {
  morning: '오늘 아침 가장 먼저 하고 싶은 일이 뭐야?',
  evening: '오늘 하루 중 가장 기억에 남는 감정은?',
  running: '오늘 운동 계획이 있어? 없으면 만들어줄게!',
  mandalart: '오늘 달성하고 싶은 목표를 하나만 말해봐!',
};

const MODE_GUIDE_MESSAGES: Record<string, string> = {
  morning: '오늘 아침루틴에서 가장 중요한 1가지를 말해줘.',
  evening: '오늘 느꼈던 감정 하나를 솔직하게 말해봐.',
  running: '지금 운동할 준비가 됐어? 아니면 핑계가 있어?',
  mandalart: '만다라트의 어떤 칸을 오늘 실천할 거야?',
};

interface LocalMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface NagChatProps {
  mode: 'morning' | 'evening' | 'running' | 'mandalart';
}

export default function NagChat({ mode }: NagChatProps) {
  const router = useRouter();
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
      if (!currentSession) {
        try {
          const newSession = await createNewSession();
          if (newSession) {
            router.push(`/chat/${newSession.id}?start=${encodeURIComponent(content)}`);
          }
        } catch (error) {
          console.error('Failed to create session:', error);
        }
      } else {
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
        const responses = DUMMY_RESPONSES[mode] || DUMMY_RESPONSES.morning;
        const aiMessage: LocalMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: responses[Math.floor(Math.random() * responses.length)],
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
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
              <h2 className="text-xl font-semibold mb-2">{MODE_TITLES[mode]}</h2>
              <p className="text-sm max-w-xs mx-auto">{MODE_GUIDE_MESSAGES[mode]}</p>
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
              placeholder={MODE_PLACEHOLDERS[mode]}
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
      </div>
    </div>
  );
}
