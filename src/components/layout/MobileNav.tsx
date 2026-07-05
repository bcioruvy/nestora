import { useState } from 'react';
import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Receipt,
  Menu,
  BarChart3,
  Settings as SettingsIcon,
  Sun,
  Moon,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const primaryItems = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, end: false },
  { to: '/budget', label: 'Budget', icon: PiggyBank, end: false },
  { to: '/bills', label: 'Bills', icon: Receipt, end: false },
];

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <nav className="no-print fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-surface/90 px-2 py-2 backdrop-blur-lg md:hidden">
        {primaryItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }: { isActive: boolean }) =>
              `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium ${
                isActive ? 'text-moss' : 'text-ink-muted'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium text-ink-muted"
        >
          <Menu size={20} />
          More
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} />
          <div className="relative w-full rounded-t-3xl border-t border-border bg-surface p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-ink">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="text-ink-muted">
                <X size={22} />
              </button>
            </div>

            <NavLink
              to="/analytics"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink"
            >
              <BarChart3 size={19} /> Analytics
            </NavLink>
            <NavLink
              to="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink"
            >
              <SettingsIcon size={19} /> Settings
            </NavLink>
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-ink"
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            <div className="my-2 border-t border-border" />

            <div className="flex items-center gap-3 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brass-soft font-display text-sm font-semibold text-brass">
                {(user?.displayName || user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{user?.displayName || 'Account'}</p>
                <p className="truncate text-xs text-ink-muted">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => signOutUser()}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-clay"
            >
              <LogOut size={19} /> Log out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
