import React from 'react';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Card<span className="text-sky-600">X</span>Manager
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link href="/" className="hover:text-sky-600 transition">Dashboard</Link>
          <Link href="/analytics" className="hover:text-sky-600 transition">Analytics</Link>
          <Link href="/settings" className="hover:text-sky-600 transition">Settings</Link>
        </div>
      </div>
    </nav>
  );
}
