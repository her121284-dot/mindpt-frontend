'use client';

import { useState } from 'react';
import TopNav from '@/components/marketing/TopNav';
import Badge from '@/components/marketing/Badge';
import Link from 'next/link';

const LESSON = {
  title: '자동적 사고 알아차리기',
  category: 'CBT 기초',
  content: `우리는 매일 수천 가지 생각을 합니다. 그중 많은 생각은 자동으로 떠오르는데, 이것을 '자동적 사고'라고 합니다.

자동적 사고는 너무 빠르게 지나가서 의식하지 못하는 경우가 많아요. 하지만 이 생각들이 감정과 행동에 큰 영향을 미칩니다.

예를 들어, 시험에서 한 문제를 틀렸을 때:
- 자동적 사고: "나는 항상 실패해"
- 감정: 우울, 좌절
- 행동: 공부를 포기함

같은 상황에서 다르게 생각하면:
- 대안적 사고: "한 문제 틀렸지만, 나머지는 잘 풀었어"
- 감정: 아쉽지만 괜찮음
- 행동: 틀린 문제를 복습함

훈련의 핵심은 자동적 사고를 '알아차리는 것'입니다. 알아차리면 바꿀 수 있습니다.`,
  summary: [
    '자동적 사고는 무의식적으로 빠르게 떠오르는 생각',
    '이 생각이 감정과 행동을 결정함',
    '같은 상황 → 다른 생각 → 다른 감정/행동',
    '핵심: 먼저 알아차리기 → 그다음 바꾸기',
  ],
};

export default function DemoLesson() {
  const [showSummary, setShowSummary] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <section className="pt-12 pb-20 px-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-6 flex items-center gap-2">
            <Badge>DEMO MODE</Badge>
            <Badge variant="gray">{LESSON.category}</Badge>
          </div>

          <h1 className="text-2xl font-bold text-[#111]">{LESSON.title}</h1>
          <div className="mt-1 w-8 h-1 rounded-full bg-[#FF6A00]" />

          <div className="mt-8 prose-sm">
            {LESSON.content.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-sm text-[#333] leading-relaxed mb-4 whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>

          <button
            onClick={() => setShowSummary(true)}
            className="mt-6 w-full py-3 rounded-xl bg-[#FF6A00] text-white font-semibold hover:bg-[#E85F00] transition-colors"
          >
            핵심 요약 보기
          </button>

          {showSummary && (
            <div className="mt-6 p-5 bg-[#FFF1E6] border border-[#FF6A00]/20 rounded-xl">
              <p className="text-xs font-semibold text-[#FF6A00] mb-3">핵심 요약</p>
              <ul className="space-y-2">
                {LESSON.summary.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#111]">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FF6A00] text-white text-xs flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
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
