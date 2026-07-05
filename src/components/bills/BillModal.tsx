import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { COMMON_BILL_NAMES, type Bill, type BillRecurrence } from '../../types';

interface BillModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Bill, 'id'>) => Promise<void>;
  initial?: Bill | null;
}

export default function BillModal({ open, onClose, onSave, initial }: BillModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? new Date().toISOString().slice(0, 10));
  const [recurrence, setRecurrence] = useState<BillRecurrence>(initial?.recurrence ?? 'monthly');
  const [status, setStatus] = useState<'paid' | 'unpaid'>(initial?.status ?? 'unpaid');
  const [saving, setSaving] = useState(false);

  useBodyScrollLock(open);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount || Number(amount) <= 0) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), amount: Number(amount), dueDate, recurrence, status });
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
          <h2 className="font-display text-xl font-semibold text-ink">{initial ? 'Edit bill' : 'Add bill'}</h2>
          <button onClick={onClose} className="text-ink-muted">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              id="billName"
              type="text"
              label="Bill name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electricity"
              list="bill-name-suggestions"
              required
            />
            <datalist id="bill-name-suggestions">
              {COMMON_BILL_NAMES.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>

          <Input
            id="billAmount"
            type="number"
            step="0.01"
            min="0"
            label="Amount (PKR)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />

          <Input
            id="billDueDate"
            type="date"
            label="Due date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-muted">Recurring frequency</label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as BillRecurrence)}
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
            >
              <option value="none">One-time</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="flex rounded-xl border border-border p-1">
            <button
              type="button"
              onClick={() => setStatus('unpaid')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                status === 'unpaid' ? 'bg-clay-soft text-clay' : 'text-ink-muted'
              }`}
            >
              Unpaid
            </button>
            <button
              type="button"
              onClick={() => setStatus('paid')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                status === 'paid' ? 'bg-moss-soft text-moss' : 'text-ink-muted'
              }`}
            >
              Paid
            </button>
          </div>

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
