'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import AdSlot from '@/components/AdSlot';
import { settings, FontSize } from '@/lib/settings';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function CounselPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('default');

  useEffect(() => {
    const appSettings = settings.getSettings();
    setFontSize(appSettings.fontSize);
  }, []);

  const fontSizeClass = settings.getFontSizeClass(fontSize);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // 더미 AI 응답 (상담챗 스타일)
    setTimeout(() => {
      const responses = [
        '지금 느끼시는 감정에 대해 더 이야기해 주시겠어요?',
        '그런 상황에서 힘드셨겠네요. 지금 기분이 어떠세요?',
        '말씀해 주셔서 감사합니다. 함께 방법을 찾아볼게요.',
        '그런 생각이 드실 때가 있으시군요. 충분히 이해할 수 있어요.',
      ];
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
      };
      setMessages((prev) => [...prev, aiMessage]);
      setLoading(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="상담챗"
        showSettings
        settingsHref="/counsel/settings"
      />

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
