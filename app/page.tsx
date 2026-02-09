import TopNav from '@/components/marketing/TopNav';
import SectionTitle from '@/components/marketing/SectionTitle';
import FeatureCard from '@/components/marketing/FeatureCard';
import Badge from '@/components/marketing/Badge';
import ImageFrame from '@/components/marketing/ImageFrame';
import Link from 'next/link';

const FEATURES = [
  {
    title: '마음훈련 레슨',
    description: '진단 → 설명 → 연습 → 피드백. 체계적인 CBT 기반 훈련으로 마음 근력을 키웁니다.',
    icon: '📖',
    href: '/demo/lesson',
    badge: '2분',
  },
  {
    title: '상담챗',
    description: '지금 떠오르는 감정을 편하게 이야기하세요. AI 튜터가 함께 정리합니다.',
    icon: '💬',
    href: '/demo/counsel',
    badge: '1분',
  },
  {
    title: '잔소리챗',
    description: '목표를 정하고 잔소리를 받으세요. 따뜻한 잔소리부터 팩폭까지, 톤을 선택할 수 있습니다.',
    icon: '📢',
    href: '/demo/nag',
    badge: '1분',
  },
  {
    title: '만다라트',
    description: '81칸 만다라트로 핵심 목표를 구조화하고, 실행 계획을 세웁니다.',
    icon: '🎯',
    href: '/demo/mandalart',
    badge: '2분',
  },
];

const STEPS = [
  { num: '1', title: '3분 체험', desc: '데모로 레슨과 상담을 직접 경험해보세요.' },
  { num: '2', title: '마음 훈련 시작', desc: '나에게 맞는 레슨을 선택하고 매일 훈련합니다.' },
  { num: '3', title: '변화 확인', desc: '반복 훈련으로 생각 패턴이 바뀌는 걸 체감합니다.' },
];

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      {/* Hero — 2-column */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="flex items-center gap-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]/25" />
            </div>
            <Badge>MIND MOVEMENT</Badge>
            <h1 className="mt-5 text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111] leading-[4] tracking-wider">
              마음이 바뀌면, 태도가 바뀝니다.<br />
              태도가 바뀌면, 삶이 바뀝니다.
            </h1>
            <p className="mt-6 text-[#666] text-base sm:text-lg leading-relaxed">
              상담은 마음을 들여다보고, 마인드피티는 마음을 성장시킵니다.
            </p>
            <p className="mt-3 text-[#666] text-base sm:text-lg leading-relaxed">
              6단계 마음 운동 프로그램으로, 당신의 마음에 단단한 근육을 만듭니다.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Link
                href="/demo"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#FF6A00] text-white font-semibold hover:bg-[#E85F00] transition-colors text-center"
              >
                3분 데모 체험하기
              </Link>
              <a
                href="#service"
                className="w-full sm:w-auto px-8 py-3 rounded-xl border border-[#EAEAEA] text-[#666] font-medium hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors text-center"
              >
                서비스 둘러보기
              </a>
            </div>
          </div>
          {/* Right: Image */}
          <div className="hidden lg:block">
            <ImageFrame
              src="/marketing/service.jpg"
              alt="마음 훈련 이미지"
              aspect="tall"
              priority
            />
          </div>
        </div>
      </section>

      {/* Service */}
      <section id="service" className="py-16 px-6 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto">
          <SectionTitle title="이런 훈련을 할 수 있어요" sub="각 기능을 직접 체험해보세요" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionTitle title="사용 흐름" sub="3단계로 마음 훈련을 시작하세요" />

          {/* Wide banner image */}
          <div className="mb-8">
            <ImageFrame
              src="/marketing/demo.jpg"
              alt="마음 훈련 데모 화면"
              aspect="wide"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center p-6 bg-white border border-[#EAEAEA] rounded-xl">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#FFF1E6] text-[#FF6A00] font-bold flex items-center justify-center text-lg">
                  {s.num}
                </div>
                <h3 className="mt-3 font-semibold text-[#111]">{s.title}</h3>
                <p className="mt-1 text-sm text-[#666]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section id="community" className="py-16 px-6 bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto text-center">
          <SectionTitle title="커뮤니티" sub="같은 고민을 가진 사람들과 함께하세요" />
          <a
            href="https://cafe.naver.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#EAEAEA] bg-white text-[#111] font-medium hover:border-[#FF6A00] hover:text-[#FF6A00] transition-colors"
          >
            네이버 카페 바로가기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111]">
            오늘 3분 체험으로 시작하세요.
          </h2>
          <div className="mt-2 mx-auto w-10 h-1 rounded-full bg-[#FF6A00]" />
          <p className="mt-4 text-[#666]">작은 훈련이 큰 변화를 만듭니다.</p>
          <Link
            href="/demo"
            className="mt-6 inline-block px-8 py-3 rounded-xl bg-[#FF6A00] text-white font-semibold hover:bg-[#E85F00] transition-colors"
          >
            무료 체험 시작
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#EAEAEA]">
        <div className="max-w-3xl mx-auto text-center text-xs text-[#999]">
          <p>MINDPT - 마음을 훈련하는 AI 튜터</p>
        </div>
      </footer>
    </div>
  );
}
