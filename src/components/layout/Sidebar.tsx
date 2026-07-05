import { useState } from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
  ChevronsLeft,
  ChevronsRight,
  Sun,
  Moon,
  LogOut,
  Search,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationCenter from '../notifications/NotificationCenter';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, end: false },
  { to: '/budget', label: 'Budget', icon: PiggyBank, end: false },
  { to: '/bills', label: 'Bills', icon: Receipt, end: false },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, end: false },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, end: false },
];

interface SidebarProps {
  onSearchClick: () => void;
}

export default function Sidebar({ onSearchClick }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className={`no-print sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto border-r border-border bg-surface transition-all duration-200 md:flex ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-moss font-display text-lg font-bold text-white">
          N
        </div>
        {!collapsed && <span className="font-display text-lg font-semibold text-ink">Nestora</span>}
      </div>

      {!collapsed && (
        <div className="mb-2 flex items-center gap-2 px-3">
          <button
            onClick={onSearchClick}
            className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-ink-muted hover:bg-moss-soft/60"
          >
            <Search size={16} /> Search
          </button>
          <NotificationCenter />
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-moss-soft text-moss' : 'text-ink-muted hover:bg-moss-soft/60 hover:text-ink'
              }`
            }
          >
            <Icon size={19} strokeWidth={2} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-4">
        {collapsed && (
          <button
            onClick={onSearchClick}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-moss-soft/60 hover:text-ink"
          >
            <Search size={19} />
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-moss-soft/60 hover:text-ink"
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-moss-soft/60 hover:text-ink"
        >
          {collapsed ? <ChevronsRight size={19} /> : <ChevronsLeft size={19} />}
          {!collapsed && <span>Collapse</span>}
        </button>

        <div className={`mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brass-soft font-display text-sm font-semibold text-brass">
            {(user?.displayName || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{user?.displayName || 'Account'}</p>
              <p className="truncate text-xs text-ink-muted">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => signOutUser()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-clay transition-colors hover:bg-clay-soft"
        >
          <LogOut size={19} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}
