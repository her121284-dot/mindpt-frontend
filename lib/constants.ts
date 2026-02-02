/**
 * Application constants
 */

// External URLs
export const EXTERNAL_URLS = {
  NAVER_CAFE: 'https://cafe.naver.com/blackfeeqo', // MINDPT cafe URL
} as const;

// Homework template for clipboard copy
export const HOMEWORK_TEMPLATE = `[오늘의 글쓰기 숙제]

1) 오늘의 감정:
2) 상황:
3) 내가 한 해석:
4) 내가 진짜 원한 것(욕구/가치):
5) 다음 행동 선택(1개):
`;

// LocalStorage keys
export const STORAGE_KEYS = {
  HOMEWORK_DONE_PREFIX: 'mindpt_homework_done_',
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
