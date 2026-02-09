'use client';

import Link from 'next/link';

export default function TopNav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#EAEAEA]">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-14">
        <Link href="/" className="font-bold text-[#111] text-lg tracking-wide">
          <span className="text-[#FF6A00]">●</span> MINDPT
        </Link>
        <Link
          href="/demo"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-[#FF6A00] text-white hover:bg-[#E85F00] transition-colors"
        >
          3분 데모 체험
        </Link>
      </div>
    </nav>
  );
}
