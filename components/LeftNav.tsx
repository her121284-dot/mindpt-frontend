'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { EXTERNAL_URLS } from '@/lib/constants';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  external?: boolean;
}

const menuItems: MenuItem[] = [
  { id: 'my', label: '마이메뉴', href: '/my', icon: 'user' },
  { id: 'new-chat', label: '새로운 채팅', href: '/chat/new', icon: 'plus' },
  { id: 'conversations', label: '채팅 목록', href: '/conversations', icon: 'list' },
  { id: 'cafe', label: '마인드피티 네이버 카페', href: EXTERNAL_URLS.NAVER_CAFE, icon: 'external', external: true },
  { id: 'counsel', label: '상담챗', href: '/counsel', icon: 'heart' },
  { id: 'coach', label: '코칭챗', href: '/coach', icon: 'target' },
  { id: 'mall', label: '마인드피티 몰', href: '/mall', icon: 'shop' },
];

function getIcon(iconType: string) {
  switch (iconType) {
    case 'user':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'plus':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      );
    case 'list':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      );
    case 'external':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      );
    case 'heart':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'target':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'shop':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LeftNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/my' && pathname === '/my') return true;
    if (href === '/chat/new' && pathname === '/chat/new') return true;
    if (href === '/conversations' && pathname === '/conversations') return true;
    if (href === '/counsel' && (pathname === '/counsel' || pathname.startsWith('/counsel/'))) return true;
    if (href === '/coach' && (pathname === '/coach' || pathname.startsWith('/coach/'))) return true;
    if (href === '/mall' && pathname === '/mall') return true;
    return false;
  };

  return (
    <nav className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-wide" style={{ letterSpacing: '1px' }}>
          MINDPT
        </h1>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-2">
        {menuItems.map((item) => {
          if (item.external) {
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg hover:bg-gray-800 transition-colors"
                style={{ letterSpacing: '0.8px' }}
              >
                {getIcon(item.icon)}
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300 hover:text-white'
              }`}
              style={{ letterSpacing: '0.8px' }}
            >
              {getIcon(item.icon)}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500 text-center">
        © 2024 MINDPT
      </div>
    </nav>
  );
}
