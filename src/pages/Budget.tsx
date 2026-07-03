import { useMemo, useState } from 'react';
import { Plus, Pencil, AlertTriangle, Trash2 } from 'lucide-react';
import { useBudget } from '../hooks/useBudget';
import { useTransactions } from '../hooks/useTransactions';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { formatCurrency } from '../lib/format';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import BudgetModal from '../components/budget/BudgetModal';
import SavingsGoalModal from '../components/savings/SavingsGoalModal';
import type { SavingsGoal } from '../types';

export default function Budget() {
  const { budget, loading: budgetLoading, saveBudget } = useBudget();
  const { transactions } = useTransactions();
  const { goals, loading: goalsLoading, addGoal, updateGoal, removeGoal } = useSavingsGoals();
  const { showToast } = useToast();

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [fundingGoalId, setFundingGoalId] = useState<string | null>(null);
  const [fundAmount, setFundAmount] = useState('');

  const monthSpend = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const totals: Record<string, number> = {};
    let overallSpent = 0;
    for (const t of transactions) {
      if (t.type === 'expense' && t.date?.startsWith(monthKey)) {
        totals[t.category] = (totals[t.category] ?? 0) + t.amount;
        overallSpent += t.amount;
      }
    }
    return { totals, overallSpent };
  }, [transactions]);

  const overallRemaining = budget.overallAmount - monthSpend.overallSpent;
  const overallProgress = budget.overallAmount > 0 ? (monthSpend.overallSpent / budget.overallAmount) * 100 : 0;
  const budgetedCategories = Object.entries(budget.categoryAmounts || {});
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);

  function openAddGoal() {
    setEditingGoal(null);
    setGoalModalOpen(true);
  }
  function openEditGoal(goal: SavingsGoal) {
    setEditingGoal(goal);
    setGoalModalOpen(true);
  }
  async function handleSaveGoal(data: Omit<SavingsGoal, 'id'>) {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data);
      showToast('Goal updated');
    } else {
      await addGoal(data);
      showToast('Goal created');
    }
  }
  async function handleDeleteGoal(id: string) {
    if (confirm('Delete this savings goal?')) {
      await removeGoal(id);
      showToast('Goal deleted');
    }
  }
  async function handleAddFunds(goal: SavingsGoal) {
    const amount = Number(fundAmount);
    if (amount > 0) {
      await updateGoal(goal.id, { savedAmount: goal.savedAmount + amount });
      showToast(`Added ${formatCurrency(amount)} to ${goal.name}`);
    }
    setFundingGoalId(null);
    setFundAmount('');
  }
  async function handleSaveBudget(data: Parameters<typeof saveBudget>[0]) {
    await saveBudget(data);
    showToast('Budget saved');
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Budget</h1>
        <Button onClick={() => setBudgetModalOpen(true)}>
          <Pencil size={16} /> {budget.overallAmount > 0 ? 'Edit budget' : 'Set up budget'}
        </Button>
      </div>

      {budgetLoading ? (
        <Card>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-8 w-48" />
          <Skeleton className="mt-3 h-2 w-full" />
        </Card>
      ) : (
        <Card accent={overallRemaining < 0 ? 'clay' : 'moss'}>
          {budget.overallAmount === 0 ? (
            <p className="py-4 text-center text-sm text-ink-muted">
              No overall budget set yet. Tap &quot;Set up budget&quot; to get started.
            </p>
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">
                  This month&apos;s budget
                </p>
                {overallRemaining < 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-clay">
                    <AlertTriangle size={13} /> Over budget
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-semibold tabular-nums text-ink">
                  {formatCurrency(monthSpend.overallSpent)}
                </span>
                <span className="text-sm text-ink-muted">of {formatCurrency(budget.overallAmount)}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-moss-soft">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${overallRemaining < 0 ? 'bg-clay' : 'bg-moss'}`}
                  style={{ width: `${Math.min(100, overallProgress)}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                {overallRemaining >= 0
                  ? `${formatCurrency(overallRemaining)} remaining this month`
                  : `${formatCurrency(Math.abs(overallRemaining))} over budget`}
              </p>
            </>
          )}
        </Card>
      )}

      {budgetedCategories.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Category budgets</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {budgetedCategories.map(([cat, amount]) => {
              const spent = monthSpend.totals[cat] ?? 0;
              const over = spent > amount;
              const pct = amount > 0 ? (spent / amount) * 100 : 0;
              return (
                <Card key={cat}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">{cat}</span>
                    {over && <AlertTriangle size={14} className="text-clay" />}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-moss-soft">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-clay' : 'bg-moss'}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-ink-muted">
                    {formatCurrency(spent)} of {formatCurrency(amount)}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Savings goals</h2>
            {goals.length > 0 && (
              <p className="text-xs text-ink-muted">{formatCurrency(totalSaved)} saved across {goals.length} goal{goals.length === 1 ? '' : 's'}</p>
            )}
          </div>
          <Button size="sm" variant="secondary" onClick={openAddGoal}>
            <Plus size={15} /> New goal
          </Button>
        </div>

        {goalsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card><Skeleton className="h-4 w-2/3" /><Skeleton className="mt-3 h-2 w-full" /></Card>
            <Card><Skeleton className="h-4 w-2/3" /><Skeleton className="mt-3 h-2 w-full" /></Card>
          </div>
        ) : goals.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="font-medium text-ink">No savings goals yet</p>
            <p className="max-w-sm text-sm text-ink-muted">
              An emergency fund, a vacation, new furniture — set a target and track your progress.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {goals.map((goal) => {
              const pct = goal.targetAmount > 0 ? Math.min(100, (goal.savedAmount / goal.targetAmount) * 100) : 0;
              return (
                <Card key={goal.id} accent="brass">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-ink">{goal.name}</p>
                      {goal.deadline && <p className="text-xs text-ink-muted">Target date: {goal.deadline}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button onClick={() => openEditGoal(goal)} className="rounded-lg p-1.5 text-ink-muted hover:bg-moss-soft/60">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="rounded-lg p-1.5 text-clay hover:bg-clay-soft">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-brass-soft">
                    <div className="h-full rounded-full bg-brass transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-2 font-mono text-sm tabular-nums text-ink">
                    {formatCurrency(goal.savedAmount)}{' '}
                    <span className="text-ink-muted">of {formatCurrency(goal.targetAmount)}</span>
                  </p>
                  <p className="text-xs text-ink-muted">{pct.toFixed(0)}% there</p>

                  {fundingGoalId === goal.id ? (
                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        id={`fund-${goal.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        placeholder="Amount"
                        className="!py-1.5"
                      />
                      <Button size="sm" onClick={() => handleAddFunds(goal)}>
                        Add
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setFundingGoalId(goal.id)}
                      className="mt-3 text-sm font-medium text-brass hover:underline"
                    >
                      + Add funds
                    </button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BudgetModal
        open={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        initial={budget}
      />
      <SavingsGoalModal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={handleSaveGoal}
        initial={editingGoal}
      />
    </div>
  );
}
