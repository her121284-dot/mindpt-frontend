import TopNav from '@/components/marketing/TopNav';
import SectionTitle from '@/components/marketing/SectionTitle';
import FeatureCard from '@/components/marketing/FeatureCard';
import Link from 'next/link';

const DEMOS = [
  {
    title: '마음훈련 레슨',
    description: '샘플 레슨을 읽고 핵심 요약을 확인해보세요.',
    icon: '📖',
    href: '/demo/lesson',
    badge: '2분',
  },
  {
    title: '상담챗',
    description: '한 줄 고민을 입력하면 AI 튜터의 응답을 미리 볼 수 있어요.',
    icon: '💬',
    href: '/demo/counsel',
    badge: '1분',
  },
  {
    title: '잔소리챗',
    description: '목표와 톤을 선택하면 맞춤 잔소리를 받아볼 수 있어요.',
    icon: '📢',
    href: '/demo/nag',
    badge: '1분',
  },
  {
    title: '만다라트',
    description: '핵심 목표를 입력하면 만다라트 구조를 미리 볼 수 있어요.',
    icon: '🎯',
    href: '/demo/mandalart',
    badge: '2분',
  },
];

export default function DemoHub() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      <section className="pt-12 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <SectionTitle
            title="3분 체험"
            sub="로그인 없이 마인드피티의 핵심 기능을 직접 체험해보세요."
          />

          <div className="space-y-4">
            {DEMOS.map((d) => (
              <FeatureCard key={d.title} {...d} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <span className="inline-block px-4 py-2 rounded-lg bg-gray-100 text-[#999] text-sm cursor-not-allowed">
              실제 앱 (Coming soon)
            </span>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-[#666] hover:text-[#FF6A00] transition-colors">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
