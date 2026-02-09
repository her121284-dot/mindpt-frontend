'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import LeftNav from './LeftNav';

const NO_NAV_ROUTES = ['/login', '/register'];

function isMarketingRoute(path: string) {
  return path === '/' || path.startsWith('/demo');
}

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNav = !NO_NAV_ROUTES.includes(pathname) && !isMarketingRoute(pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Body scroll lock when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [drawerOpen]);

  // ESC key to close drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  // Focus trap: focus drawer when opened
  useEffect(() => {
    if (drawerOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [drawerOpen]);

  if (!showNav) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop: Fixed Left Navigation */}
      <aside className="hidden md:flex flex-shrink-0 w-64 min-w-0 max-w-64 overflow-hidden">
        <LeftNav />
      </aside>

      {/* Mobile: Top bar + Drawer */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1
            className="ml-3 text-lg font-bold text-gray-900 dark:text-white"
            style={{ letterSpacing: '0.08em' }}
          >
            MINDPT
          </h1>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-white dark:bg-gray-950">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="메뉴"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div
            ref={drawerRef}
            tabIndex={-1}
            className="relative w-64 max-w-[80vw] flex-shrink-0 animate-slide-in-left outline-none"
          >
            <LeftNav onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
