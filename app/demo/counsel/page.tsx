'use client';

import { useState } from 'react';
import TopNav from '@/components/marketing/TopNav';
import Badge from '@/components/marketing/Badge';
import Link from 'next/link';

const SAMPLE_RESPONSES = [
  '그런 감정을 느끼는 건 자연스러운 거예요. 지금 그 감정을 인식하고 있다는 것 자체가 중요한 첫 걸음입니다. 혹시 그 감정이 시작된 구체적인 상황이 있었나요?',
  '많이 힘드셨겠네요. 감정을 말로 표현하는 것만으로도 마음이 조금 가벼워질 수 있어요. 지금 가장 크게 느껴지는 감정 하나를 골라본다면 어떤 건가요?',
  '그 상황에서 그렇게 느끼는 건 충분히 이해할 수 있어요. 우리가 함께 그 감정을 정리해볼까요? 먼저, 그 감정이 1~10 중 몇 정도의 강도인지 느껴보세요.',
  '지금 솔직하게 이야기해주셔서 감사해요. 감정을 회피하지 않고 마주하는 게 훈련의 시작이에요. 이 감정이 반복되는 패턴이 있나요?',
];

export default function DemoCounsel() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [showed, setShowed] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const idx = Math.floor(Math.random() * SAMPLE_RESPONSES.length);
    setResponse(SAMPLE_RESPONSES[idx]);
    setShowed(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <section className="pt-12 pb-20 px-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-6">
            <Badge>DEMO MODE</Badge>
          </div>

          <h1 className="text-2xl font-bold text-[#111]">상담챗 체험</h1>
          <div className="mt-1 w-8 h-1 rounded-full bg-[#FF6A00]" />
          <p className="mt-3 text-sm text-[#666]">
            지금 느끼는 감정이나 고민을 한 줄로 적어보세요. AI 튜터가 응답합니다.
          </p>

          <div className="mt-8 space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="예: 요즘 아무것도 하기 싫고 무기력해요..."
              className="w-full p-4 border border-[#EAEAEA] rounded-xl text-sm text-[#111] placeholder-[#BBB] focus:outline-none focus:border-[#FF6A00] resize-none"
              rows={3}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="w-full py-3 rounded-xl bg-[#FF6A00] text-white font-semibold hover:bg-[#E85F00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              답변 보기
            </button>
          </div>

          {showed && (
            <div className="mt-6 p-5 bg-[#FFF1E6] border border-[#FF6A00]/20 rounded-xl">
              <p className="text-xs font-semibold text-[#FF6A00] mb-2">AI 튜터 응답 (샘플)</p>
              <p className="text-sm text-[#111] leading-relaxed">{response}</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link href="/demo" className="text-sm text-[#666] hover:text-[#FF6A00] transition-colors">
              ← 데모 목록으로
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
