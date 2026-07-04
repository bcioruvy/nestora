import { useState, type FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  type Transaction,
  type TransactionType,
} from '../../types';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id'>) => Promise<void>;
  initial?: Transaction | null;
  defaultType?: TransactionType;
}

export default function TransactionModal({
  open,
  onClose,
  onSave,
  initial,
  defaultType,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? defaultType ?? 'expense');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState(initial?.paymentMethod ?? PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  const [saving, setSaving] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (!(categories as readonly string[]).includes(category)) {
      setCategory(categories[0]);
    }
    // eslint-disable-next-line
  }, [type]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSaving(true);
    try {
      await onSave({
        type,
        amount: Number(amount),
        category: category || categories[0],
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="animate-modal-in relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-surface p-6 md:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">
            {initial ? 'Edit transaction' : 'Add transaction'}
          </h2>
          <button onClick={onClose} className="text-ink-muted">
            <X size={22} />
          </button>
        </div>

        <div className="mb-5 flex rounded-xl border border-border p-1">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              type === 'expense' ? 'bg-clay-soft text-clay' : 'text-ink-muted'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              type === 'income' ? 'bg-moss-soft text-moss' : 'text-ink-muted'
            }`}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            label="Amount (PKR)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Input
            id="date"
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              {PAYMENT_METHODS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <Input
            id="notes"
            type="text"
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add a note"
          />

          <Input
            id="tags"
            type="text"
            label="Tags (optional, comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. household, urgent"
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
