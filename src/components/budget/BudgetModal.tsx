import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { EXPENSE_CATEGORIES, type BudgetConfig } from '../../types';

interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: BudgetConfig) => Promise<void>;
  initial: BudgetConfig;
}

export default function BudgetModal({ open, onClose, onSave, initial }: BudgetModalProps) {
  const [overallAmount, setOverallAmount] = useState(initial.overallAmount ? String(initial.overallAmount) : '');
  const [categoryAmounts, setCategoryAmounts] = useState<Record<string, string>>(
    Object.fromEntries(
      EXPENSE_CATEGORIES.map((c) => [c, initial.categoryAmounts?.[c] ? String(initial.categoryAmounts[c]) : '']),
    ),
  );
  const [saving, setSaving] = useState(false);

  useBodyScrollLock(open);

  if (!open) return null;

  function updateCategory(cat: string, value: string) {
    setCategoryAmounts((prev) => ({ ...prev, [cat]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedCategories: Record<string, number> = {};
      for (const [cat, val] of Object.entries(categoryAmounts)) {
        if (val && Number(val) > 0) parsedCategories[cat] = Number(val);
      }
      await onSave({ overallAmount: Number(overallAmount) || 0, categoryAmounts: parsedCategories });
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
          <h2 className="font-display text-xl font-semibold text-ink">Edit budget</h2>
          <button onClick={onClose} className="text-ink-muted">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="overallAmount"
            type="number"
            step="0.01"
            min="0"
            label="Overall monthly budget (PKR)"
            value={overallAmount}
            onChange={(e) => setOverallAmount(e.target.value)}
            placeholder="0.00"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-ink-muted">Category budgets (optional)</p>
            <div className="space-y-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-ink">{cat}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={categoryAmounts[cat]}
                    onChange={(e) => updateCategory(cat, e.target.value)}
                    placeholder="0"
                    className="w-28 rounded-lg border border-border bg-surface px-3 py-1.5 text-right text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : 'Save budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
