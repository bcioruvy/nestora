import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, ArrowLeftRight, Receipt } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import { useBills } from '../../hooks/useBills';
import { formatCurrency } from '../../lib/format';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const { transactions } = useTransactions();
  const { bills } = useBills();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { transactions: [], bills: [] };

    const matchedTransactions = transactions
      .filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q)),
      )
      .slice(0, 6);

    const matchedBills = bills.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 6);

    return { transactions: matchedTransactions, bills: matchedBills };
  }, [query, transactions, bills]);

  if (!open) return null;

  function goTo(path: string) {
    navigate(path);
    onClose();
    setQuery('');
  }

  const hasResults = results.transactions.length > 0 || results.bills.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-28">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="animate-modal-in relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search size={18} className="shrink-0 text-ink-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions, bills, notes, tags…"
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <button onClick={onClose} className="shrink-0 text-ink-muted">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {!query.trim() ? (
            <p className="px-3 py-8 text-center text-sm text-ink-muted">
              Start typing to search across transactions and bills.
            </p>
          ) : !hasResults ? (
            <p className="px-3 py-8 text-center text-sm text-ink-muted">No matches for &quot;{query}&quot;.</p>
          ) : (
            <>
              {results.transactions.length > 0 && (
                <div className="mb-1">
                  <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-ink-muted">
                    Transactions
                  </p>
                  {results.transactions.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => goTo('/transactions')}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-moss-soft/60"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <ArrowLeftRight size={15} className="shrink-0 text-ink-muted" />
                        <div className="min-w-0">
                          <p className="truncate text-sm text-ink">{t.category}</p>
                          <p className="truncate text-xs text-ink-muted">{t.notes || t.date}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 font-mono text-xs tabular-nums ${
                          t.type === 'income' ? 'text-moss' : 'text-clay'
                        }`}
                      >
                        {formatCurrency(t.amount)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.bills.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-ink-muted">Bills</p>
                  {results.bills.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => goTo('/bills')}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left hover:bg-moss-soft/60"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Receipt size={15} className="shrink-0 text-ink-muted" />
                        <p className="truncate text-sm text-ink">{b.name}</p>
                      </div>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-ink-muted">
                        {formatCurrency(b.amount)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
