'use client';

import { usePathname } from 'next/navigation';
import LeftNav from './LeftNav';

const NO_NAV_ROUTES = ['/login', '/register'];

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNav = !NO_NAV_ROUTES.includes(pathname);

  if (!showNav) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Fixed Left Navigation */}
      <aside className="flex-shrink-0 w-64 min-w-0 max-w-64 overflow-hidden">
        <LeftNav />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-hidden bg-white dark:bg-gray-950">
        {children}
      </main>
    </div>
  );
}
