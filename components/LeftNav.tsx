'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EXTERNAL_URLS } from '@/lib/constants';

export default function LeftNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // 공통 스타일
  const baseItemStyle = "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 max-w-full overflow-hidden";
  const activeStyle = "bg-indigo-600 text-white shadow-md";
  const inactiveStyle = "text-gray-300 hover:bg-gray-800 hover:text-white";
  const subItemStyle = "flex items-center gap-2 pl-8 pr-3 py-1.5 rounded-lg transition-all duration-200 text-sm min-w-0 max-w-full overflow-hidden";
  const subActiveStyle = "bg-gray-700 text-white";
  const subInactiveStyle = "text-gray-400 hover:bg-gray-800 hover:text-gray-200";

  return (
    <nav className="w-64 bg-gray-900 text-white flex flex-col h-full overflow-hidden max-w-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700/50">
        <h1
          className="text-xl font-bold text-white"
          style={{ letterSpacing: '0.08em' }}
        >
          MINDPT
        </h1>
      </div>

      {/* Main Menu (Scrollable) */}
      <div className="flex-1 overflow-y-auto py-2">

        {/* 마인드피티 소개 */}
        <Link
          href="/"
          className={`${baseItemStyle} ${isActive('/') && pathname === '/' ? activeStyle : inactiveStyle}`}
          style={{ letterSpacing: '0.05em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium truncate">마인드피티 소개</span>
        </Link>

        {/* 상담챗 섹션 */}
        <div className="mt-2">
          <Link
            href="/counsel"
            className={`${baseItemStyle} ${isActive('/counsel') ? activeStyle : inactiveStyle}`}
            style={{ letterSpacing: '0.05em' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="font-medium truncate">상담챗</span>
          </Link>

          {/* 상담챗 서브메뉴 */}
          <div className="mt-1 space-y-0.5">
            <Link
              href="/chat/new"
              className={`${subItemStyle} ${isActive('/chat/new') ? subActiveStyle : subInactiveStyle}`}
              style={{ letterSpacing: '0.04em' }}
            >
              <svg className="w-4 h-4 opacity-70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="truncate">새로운 채팅</span>
            </Link>
            <Link
              href="/conversations"
              className={`${subItemStyle} ${isActive('/conversations') ? subActiveStyle : subInactiveStyle}`}
              style={{ letterSpacing: '0.04em' }}
            >
              <svg className="w-4 h-4 opacity-70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="truncate">채팅목록</span>
            </Link>
          </div>
        </div>

        {/* 코칭챗 섹션 */}
        <div className="mt-2">
          <Link
            href="/coach"
            className={`${baseItemStyle} ${isActive('/coach') ? activeStyle : inactiveStyle}`}
            style={{ letterSpacing: '0.05em' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium truncate">코칭챗</span>
          </Link>

          {/* 코칭챗 서브메뉴 */}
          <div className="mt-1 space-y-0.5">
            <Link
              href="/coach"
              className={`${subItemStyle} ${pathname === '/coach' ? subActiveStyle : subInactiveStyle}`}
              style={{ letterSpacing: '0.04em' }}
            >
              <svg className="w-4 h-4 opacity-70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="truncate">새로운 레슨</span>
            </Link>
            <Link
              href="/coach/lessons"
              className={`${subItemStyle} ${isActive('/coach/lessons') ? subActiveStyle : subInactiveStyle}`}
              style={{ letterSpacing: '0.04em' }}
            >
              <svg className="w-4 h-4 opacity-70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="truncate">레슨 목록</span>
            </Link>
          </div>
        </div>

        {/* 잔소리챗 */}
        <div className="mt-2">
          <Link
            href="/nag"
            className={`${baseItemStyle} ${isActive('/nag') ? activeStyle : inactiveStyle}`}
            style={{ letterSpacing: '0.05em' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span className="font-medium truncate">잔소리챗</span>
          </Link>
        </div>

        {/* 네이버 카페 */}
        <div className="mt-2">
          <button
            onClick={() => openExternalLink(EXTERNAL_URLS.NAVER_CAFE)}
            className={`${baseItemStyle} w-full text-left ${inactiveStyle}`}
            style={{ letterSpacing: '0.05em' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="font-medium truncate">마인드피티 네이버 카페</span>
          </button>
        </div>

        {/* 마인드피티 몰 */}
        <div className="mt-1">
          <Link
            href="/mall"
            className={`${baseItemStyle} ${isActive('/mall') ? activeStyle : inactiveStyle}`}
            style={{ letterSpacing: '0.05em' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="font-medium truncate">마인드피티 몰</span>
          </Link>
        </div>
      </div>

      {/* Fixed Bottom Menu */}
      <div className="border-t border-gray-700/50 p-2 space-y-0.5 bg-gray-900">
        <Link
          href="/my"
          className={`${baseItemStyle} ${isActive('/my') ? activeStyle : inactiveStyle}`}
          style={{ letterSpacing: '0.05em' }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium truncate">마이메뉴</span>
        </Link>
        <Link
          href="/settings"
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
