import { useState } from 'react';
import { Bell, AlertTriangle, Info } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationCenter() {
  const { notifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const warningCount = notifications.filter((n) => n.severity === 'warning').length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-moss-soft/60 hover:text-ink"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span
            className={`absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-white ${
              warningCount > 0 ? 'bg-clay' : 'bg-brass'
            }`}
          >
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="animate-modal-in absolute right-0 z-50 mt-2 w-80 max-w-[85vw] rounded-2xl border border-border bg-surface p-2 shadow-xl">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-ink-muted">Notifications</p>
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink-muted">You&apos;re all caught up.</p>
            ) : (
              <div className="max-h-72 space-y-1 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-2.5 rounded-lg px-3 py-2">
                    {n.severity === 'warning' ? (
                      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-clay" />
                    ) : (
                      <Info size={15} className="mt-0.5 shrink-0 text-brass" />
                    )}
                    <p className="text-sm text-ink">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
