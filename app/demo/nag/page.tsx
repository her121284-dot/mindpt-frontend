'use client';

import { useState } from 'react';
import TopNav from '@/components/marketing/TopNav';
import Badge from '@/components/marketing/Badge';
import Link from 'next/link';

const TONES: { key: string; label: string; desc: string }[] = [
  { key: 'warm', label: '따뜻한', desc: '응원하는 톤' },
  { key: 'direct', label: '직설적', desc: '팩트 위주' },
  { key: 'tough', label: '팩폭', desc: '거침없는 잔소리' },
];

const MESSAGES: Record<string, string[]> = {
  warm: [
    '오늘도 조금만 더 힘내볼까? 어제보다 1%만 나아지면 되는 거야. 넌 할 수 있어!',
    '포기하고 싶을 때가 성장에 가장 가까운 순간이야. 오늘 딱 10분만 해보자.',
    '완벽하지 않아도 괜찮아. 시작하는 것 자체가 이미 대단한 거야.',
  ],
  direct: [
    '목표를 세워놓고 안 하면 의미가 없어. 오늘 할 수 있는 최소 단위부터 실행해.',
    '감정에 흔들리지 말고 계획에 집중해. 오늘 뭘 할 건지 구체적으로 적어.',
    '동기부여를 기다리지 마. 행동이 먼저고, 동기는 나중에 따라와.',
  ],
  tough: [
    '또 미루려고? 작심삼일이 몇 번째야? 핑계 대지 말고 당장 일어나.',
    '네가 안 하면 아무도 대신 안 해줘. 불편해도 지금 시작해.',
    '편한 게 좋으면 성장은 포기해. 불편함을 선택하는 게 훈련이야.',
  ],
};

export default function DemoNag() {
  const [goal, setGoal] = useState('');
  const [tone, setTone] = useState('warm');
  const [message, setMessage] = useState('');
  const [showed, setShowed] = useState(false);

  const handleGenerate = () => {
    if (!goal.trim()) return;
    const arr = MESSAGES[tone];
    const idx = Math.floor(Math.random() * arr.length);
    setMessage(arr[idx]);
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

          <h1 className="text-2xl font-bold text-[#111]">잔소리챗 체험</h1>
          <div className="mt-1 w-8 h-1 rounded-full bg-[#FF6A00]" />
          <p className="mt-3 text-sm text-[#666]">
            목표를 적고 톤을 선택하면, 맞춤 잔소리를 받을 수 있어요.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#111] mb-1.5">목표</label>
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="예: 매일 운동 30분 하기"
                className="w-full p-3 border border-[#EAEAEA] rounded-xl text-sm text-[#111] placeholder-[#BBB] focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111] mb-1.5">톤 선택</label>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTone(t.key)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      tone === t.key
                        ? 'border-[#FF6A00] bg-[#FFF1E6] text-[#FF6A00]'
                        : 'border-[#EAEAEA] text-[#666] hover:border-[#FF6A00]/40'
                    }`}
                  >
                    <div className="font-semibold text-sm">{t.label}</div>
                    <div className="text-xs mt-0.5 opacity-70">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!goal.trim()}
              className="w-full py-3 rounded-xl bg-[#FF6A00] text-white font-semibold hover:bg-[#E85F00] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              잔소리 받기
            </button>
          </div>

          {showed && (
            <div className="mt-6 p-5 bg-[#FFF1E6] border border-[#FF6A00]/20 rounded-xl">
              <p className="text-xs font-semibold text-[#FF6A00] mb-2">
                잔소리 ({TONES.find((t) => t.key === tone)?.label} 톤)
              </p>
              <p className="text-sm text-[#111] leading-relaxed">{message}</p>
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
