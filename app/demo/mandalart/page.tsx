'use client';

import { useState } from 'react';
import TopNav from '@/components/marketing/TopNav';
import Badge from '@/components/marketing/Badge';
import Link from 'next/link';

const SAMPLE_SUBS = [
  '매일 아침 6시 기상',
  '주 3회 운동',
  '독서 습관 만들기',
];

export default function DemoMandalart() {
  const [goal, setGoal] = useState('');
  const [showed, setShowed] = useState(false);

  const handleGenerate = () => {
    if (!goal.trim()) return;
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

          <h1 className="text-2xl font-bold text-[#111]">만다라트 체험</h1>
          <div className="mt-1 w-8 h-1 rounded-full bg-[#FF6A00]" />
          <p className="mt-3 text-sm text-[#666]">
            핵심 목표를 입력하면, 만다라트 구조의 미리보기를 확인할 수 있어요.
          </p>

          <div className="mt-8 space-y-4">
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="예: 건강한 생활 습관 만들기"
              className="w-full p-3 border border-[#EAEAEA] rounded-xl text-sm text-[#111] placeholder-[#BBB] focus:outline-none focus:border-[#FF6A00]"
            />
            <button
              onClick={handleGenerate}
              disabled={!goal.trim()}
              className="w-full py-3 rounded-xl bg-[#FF6A00] text-white font-semibold hover:bg-[#E85F00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              만다라트 미리보기
            </button>
          </div>

          {showed && (
            <div className="mt-6 space-y-4">
              {/* Center card */}
              <div className="p-5 bg-[#FFF1E6] border border-[#FF6A00]/20 rounded-xl text-center">
                <p className="text-xs font-semibold text-[#FF6A00] mb-1">핵심 목표</p>
                <p className="font-bold text-[#111]">{goal}</p>
              </div>

              {/* Sub-goal cards */}
              <div className="grid grid-cols-3 gap-3">
                {SAMPLE_SUBS.map((sub, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white border border-[#EAEAEA] rounded-xl text-center"
                  >
                    <p className="text-xs text-[#999] mb-1">하위 목표 {i + 1}</p>
                    <p className="text-sm font-medium text-[#111]">{sub}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#999] text-center">
                * 실제 앱에서는 AI가 8개의 하위 목표를 자동 생성하고, 81칸 만다라트를 완성합니다.
              </p>
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
