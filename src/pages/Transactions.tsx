import { useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency } from '../lib/format';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ListSkeleton } from '../components/ui/Skeleton';
import TransactionModal from '../components/transactions/TransactionModal';
import type { Transaction, TransactionType } from '../types';

type SortKey = 'date' | 'amount';

export default function Transactions() {
  const { transactions, loading, addTransaction, updateTransaction, removeTransaction } = useTransactions();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDesc, setSortDesc] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    let list = transactions;

    if (typeFilter !== 'all') {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) => {
      const dir = sortDesc ? -1 : 1;
      if (sortKey === 'amount') return (a.amount - b.amount) * dir;
      return a.date.localeCompare(b.date) * dir;
    });
  }, [transactions, search, typeFilter, sortKey, sortDesc]);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(t: Transaction) {
    setEditing(t);
    setModalOpen(true);
  }

  async function handleSave(data: Omit<Transaction, 'id'>) {
    if (editing) {
      await updateTransaction(editing.id, data);
      showToast('Transaction updated');
    } else {
      await addTransaction(data);
      showToast(data.type === 'income' ? 'Income added' : 'Expense added');
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this transaction?')) {
      await removeTransaction(id);
      showToast('Transaction deleted');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Transactions</h1>
        <Button onClick={openAdd}>
          <Plus size={17} /> Add transaction
        </Button>
      </div>

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category, notes, payment method"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            <option value="date">Sort by date</option>
            <option value="amount">Sort by amount</option>
          </select>

          <button
            onClick={() => setSortDesc((d) => !d)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-3.5 py-2.5 text-sm text-ink-muted hover:bg-moss-soft/60"
          >
            <ArrowUpDown size={15} /> {sortDesc ? 'Newest' : 'Oldest'}
          </button>
        </div>
      </Card>

      <Card>
        {loading ? (
          <ListSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-muted">
            No transactions match. Try a different search or add one.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">{t.category}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        t.type === 'income' ? 'bg-moss-soft text-moss' : 'bg-clay-soft text-clay'
                      }`}
                    >
                      {t.type}
                    </span>
                  </div>
                  <p className="truncate text-xs text-ink-muted">
                    {t.date} · {t.paymentMethod}
                    {t.notes ? ` · ${t.notes}` : ''}
                  </p>
                </div>
                <p
                  className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${
                    t.type === 'income' ? 'text-moss' : 'text-clay'
                  }`}
                >
                  {t.type === 'income' ? '+' : '−'}
                  {formatCurrency(t.amount)}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => openEdit(t)} className="rounded-lg p-2 text-ink-muted hover:bg-moss-soft/60">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="rounded-lg p-2 text-clay hover:bg-clay-soft">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />
    </div>
  );
}
