/**
 * Application constants
 */

// External URLs
export const EXTERNAL_URLS = {
  NAVER_CAFE: 'https://cafe.naver.com', // TODO: Replace with actual MINDPT cafe URL
} as const;

// Menu items configuration
export const MENU_ITEMS = [
  { id: 'my', label: '마이메뉴', href: '/my', icon: 'user' },
  { id: 'new-chat', label: '새로운 채팅', href: '/chat/new', icon: 'plus' },
  { id: 'conversations', label: '채팅 목록', href: '/conversations', icon: 'list' },
  { id: 'cafe', label: '마인드피티 네이버 카페', href: EXTERNAL_URLS.NAVER_CAFE, icon: 'external', external: true },
  { id: 'counsel', label: '상담챗', href: '/counsel', icon: 'heart' },
  { id: 'coach', label: '코칭챗', href: '/coach', icon: 'target' },
  { id: 'mall', label: '마인드피티 몰', href: '/mall', icon: 'shop' },
] as const;
