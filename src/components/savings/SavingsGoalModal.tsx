import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { SAVINGS_GOAL_SUGGESTIONS, type SavingsGoal } from '../../types';

interface SavingsGoalModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<SavingsGoal, 'id'>) => Promise<void>;
  initial?: SavingsGoal | null;
}

export default function SavingsGoalModal({ open, onClose, onSave, initial }: SavingsGoalModalProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(initial ? String(initial.targetAmount) : '');
  const [savedAmount, setSavedAmount] = useState(initial ? String(initial.savedAmount) : '0');
  const [deadline, setDeadline] = useState(initial?.deadline ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useBodyScrollLock(open);

  if (!open) return null;

async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !targetAmount || Number(targetAmount) <= 0) return;
    setError('');
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        targetAmount: Number(targetAmount),
        savedAmount: Number(savedAmount) || 0,
        deadline: deadline || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save goal', err);
      setError(err instanceof Error ? err.message : 'Could not save. Try again.');
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
            {initial ? 'Edit goal' : 'New savings goal'}
          </h2>
          <button onClick={onClose} className="text-ink-muted">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              id="goalName"
              type="text"
              label="Goal name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund"
              list="goal-suggestions"
              required
            />
            <datalist id="goal-suggestions">
              {SAVINGS_GOAL_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <Input
            id="targetAmount"
            type="number"
            step="0.01"
            min="0"
            label="Target amount (PKR)"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
            required
          />

          <Input
            id="savedAmount"
            type="number"
            step="0.01"
            min="0"
            label="Already saved (PKR)"
            value={savedAmount}
            onChange={(e) => setSavedAmount(e.target.value)}
            placeholder="0.00"
          />

          <Input
            id="deadline"
            type="date"
            label="Target date (optional)"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

    {error && <p className="text-sm text-clay">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : 'Save goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
