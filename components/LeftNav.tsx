'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EXTERNAL_URLS } from '@/lib/constants';

interface LeftNavProps {
  onNavigate?: () => void;
}

export default function LeftNav({ onNavigate }: LeftNavProps = {}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  // 공통 스타일
  const baseItemStyle = "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 max-w-full overflow-hidden";
  const activeStyle = "bg-indigo-600 text-white shadow-md";
  const inactiveStyle = "text-gray-300 hover:bg-gray-800 hover:text-white";
  const disabledStyle = "text-gray-500 cursor-not-allowed opacity-60";

  return (
    <nav className="w-64 bg-gray-900 text-white flex flex-col h-full overflow-hidden max-w-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700/50">
        <Link href="/home" className="block" onClick={onNavigate}>
          <h1
            className="text-xl font-bold text-white hover:text-indigo-300 transition-colors"
            style={{ letterSpacing: '0.08em' }}
          >
            MINDPT
          </h1>
        </Link>
      </div>

      {/* Main Menu (Scrollable) */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1">

        {/* 1) 마인드피티 사용법 */}
        <Link
          href="/guide"
          onClick={onNavigate}
          className={`${baseItemStyle} ${isActive('/guide') ? activeStyle : inactiveStyle}`}
          style={{ letterSpacing: '0.05em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium truncate">마인드피티 사용법</span>
        </Link>

        {/* 3) 상담챗 */}
        <Link
          href="/counsel"
          onClick={onNavigate}
          className={`${baseItemStyle} ${isActive('/counsel') ? activeStyle : inactiveStyle}`}
          style={{ letterSpacing: '0.05em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="font-medium truncate">상담챗</span>
        </Link>

        {/* 4) 잔소리챗 */}
        <Link
          href="/nag"
          onClick={onNavigate}
          className={`${baseItemStyle} ${isActive('/nag') ? activeStyle : inactiveStyle}`}
          style={{ letterSpacing: '0.05em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <span className="font-medium truncate">잔소리챗</span>
        </Link>

        {/* 5) 마음훈련 레슨 (단독 메뉴, 동급) */}
        <Link
          href="/coach"
          onClick={onNavigate}
          className={`${baseItemStyle} ${isActive('/coach') ? activeStyle : inactiveStyle}`}
          style={{ letterSpacing: '0.05em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="font-medium truncate">마음훈련 레슨</span>
        </Link>

        {/* 6) 만다라트 */}
        <Link
          href="/mandalart"
          onClick={onNavigate}
          className={`${baseItemStyle} ${isActive('/mandalart') ? activeStyle : inactiveStyle}`}
          style={{ letterSpacing: '0.05em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <span className="font-medium truncate">만다라트</span>
        </Link>

        {/* 7) 마인드피티 네이버 카페 (새창) */}
        <a
          href={EXTERNAL_URLS.NAVER_CAFE}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className={`${baseItemStyle} ${inactiveStyle}`}
          style={{ letterSpacing: '0.05em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="font-medium truncate">마인드피티 네이버 카페</span>
        </a>

        {/* 8) 마인드피티 몰 (더미 - 서비스 예정) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            alert('서비스 준비 중입니다.');
          }}
          className={`${baseItemStyle} w-full text-left ${disabledStyle}`}
          style={{ letterSpacing: '0.05em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="font-medium truncate">마인드피티 몰</span>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded-full flex-shrink-0">
            예정
          </span>
        </button>
      </div>

      {/* Fixed Bottom Menu */}
      <div className="border-t border-gray-700/50 p-2 space-y-0.5 bg-gray-900">
        {/* 9) 마이메뉴 */}
        <Link
          href="/my"
          onClick={onNavigate}
          className={`${baseItemStyle} ${isActive('/my') ? activeStyle : inactiveStyle}`}
          style={{ letterSpacing: '0.05em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium truncate">마이메뉴</span>
        </Link>

        {/* 10) 설정 */}
        <Link
          href="/settings"
          onClick={onNavigate}
          className={`${baseItemStyle} ${isActive('/settings') ? activeStyle : inactiveStyle}`}
          style={{ letterSpacing: '0.05em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium truncate">설정</span>
        </Link>
      </div>
    </nav>
  );
}
