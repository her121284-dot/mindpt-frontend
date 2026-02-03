'use client';

import { useRouter, useParams, notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import NagChat from '@/components/NagChat';

const VALID_MODES = ['morning', 'evening', 'running', 'mandalart'] as const;
type NagMode = typeof VALID_MODES[number];

const MODE_INFO: Record<NagMode, { title: string; subtitle: string }> = {
  morning: { title: '아침루틴', subtitle: '아침 시작을 도와주는 잔소리' },
  evening: { title: '저녁 감정 체크', subtitle: '하루를 정리하는 감정 돌봄' },
  running: { title: '러닝 잔소리', subtitle: '운동 습관을 만드는 동기부여' },
  mandalart: { title: '만다라트 잔소리', subtitle: '목표 달성을 위한 점검' },
};

export default function NagModePage() {
  const router = useRouter();
  const params = useParams();
  const mode = params.mode as string;

  // Validate mode
  if (!VALID_MODES.includes(mode as NagMode)) {
    notFound();
  }

  const validMode = mode as NagMode;
  const modeInfo = MODE_INFO[validMode];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={modeInfo.title}
        subtitle={modeInfo.subtitle}
        onBack={() => router.push('/nag')}
        actions={
          <button
            onClick={() => router.push(`/nag/${mode}/settings`)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="설정"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        }
      />

      <NagChat mode={validMode} />
    </div>
  );
}
