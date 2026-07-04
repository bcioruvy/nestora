import { useState } from 'react';
import { Outlet } from 'react-router';
import { Search } from 'lucide-react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import GlobalSearch from '../search/GlobalSearch';
import NotificationCenter from '../notifications/NotificationCenter';

export default function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar onSearchClick={() => setSearchOpen(true)} />
      <div className="min-w-0 flex-1">
        <header className="no-print flex items-center justify-end gap-1 border-b border-border px-4 py-2.5 md:hidden">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-moss-soft/60"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <NotificationCenter />
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
