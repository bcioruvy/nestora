import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowUpRight, ArrowDownRight, Receipt, PiggyBank } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useBudget } from '../hooks/useBudget';
import { useBills } from '../hooks/useBills';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../lib/format';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TransactionModal from '../components/transactions/TransactionModal';
import BillModal from '../components/bills/BillModal';
import type { TransactionType } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions, addTransaction } = useTransactions();
  const { budget } = useBudget();
  const { bills, addBill } = useBills();
  const { goals } = useSavingsGoals();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('expense');
  const [billModalOpen, setBillModalOpen] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let totalIncome = 0;
    let totalExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;
    const categoryTotals: Record<string, number> = {};

    for (const t of transactions) {
      if (t.type === 'income') totalIncome += t.amount;
      else totalExpense += t.amount;

      if (t.date?.startsWith(monthKey)) {
        if (t.type === 'income') {
          monthIncome += t.amount;
        } else {
          monthExpense += t.amount;
          categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + t.amount;
        }
      }
    }

    const topCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
      balance: totalIncome - totalExpense,
      monthIncome,
      monthExpense,
      topCategories,
      maxCategory: topCategories[0]?.[1] ?? 0,
    };
  }, [transactions]);

  const recent = transactions.slice(0, 5);
  const cashFlowTotal = stats.monthIncome + stats.monthExpense;
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const overallRemaining = budget.overallAmount - stats.monthExpense;
  const overallProgress =
    budget.overallAmount > 0 ? Math.min(100, (stats.monthExpense / budget.overallAmount) * 100) : 0;

  const today = new Date().toISOString().slice(0, 10);
  const upcomingBills = bills
    .filter((b) => b.status === 'unpaid')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  function openModal(type: TransactionType) {
    setModalType(type);
    setModalOpen(true);
  }

  async function handleAddTransaction(data: Parameters<typeof addTransaction>[0]) {
    await addTransaction(data);
    showToast(data.type === 'income' ? 'Income added' : 'Expense added');
  }

  async function handleAddBill(data: Parameters<typeof addBill>[0]) {
    await addBill(data);
    showToast('Bill added');
  }

  const firstName = (user?.displayName || 'there').split(' ')[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-muted">Welcome back</p>
        <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
          {firstName}&apos;s household
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Current balance</p>
          <p className="mt-2 inline-block border-b-2 border-brass pb-1 font-mono text-4xl font-semibold tabular-nums text-ink">
            {formatCurrency(stats.balance)}
          </p>
        </Card>

        <Card accent="moss">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">This month&apos;s income</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-moss">
            {formatCurrency(stats.monthIncome)}
          </p>
        </Card>

        <Card accent="clay">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">This month&apos;s expenses</p>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-clay">
            {formatCurrency(stats.monthExpense)}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Remaining budget</p>
          {budget.overallAmount === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">
              No budget set yet.{' '}
              <Link to="/budget" className="font-medium text-moss hover:underline">
                Set one up
              </Link>
            </p>
          ) : (
            <p
              className={`mt-2 font-mono text-2xl font-semibold tabular-nums ${
                overallRemaining < 0 ? 'text-clay' : 'text-ink'
              }`}
            >
              {formatCurrency(Math.abs(overallRemaining))}
              {overallRemaining < 0 && <span className="ml-1 text-xs font-medium">over</span>}
            </p>
          )}
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Total savings</p>
          {goals.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">
              No savings goals yet.{' '}
              <Link to="/budget" className="font-medium text-moss hover:underline">
                Start one
              </Link>
            </p>
          ) : (
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-brass">
              {formatCurrency(totalSaved)}
            </p>
          )}
        </Card>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Button variant="secondary" onClick={() => openModal('expense')} className="justify-start">
            <ArrowDownRight size={17} className="text-clay" /> Add expense
          </Button>
          <Button variant="secondary" onClick={() => openModal('income')} className="justify-start">
            <ArrowUpRight size={17} className="text-moss" /> Add income
          </Button>
          <Button variant="secondary" onClick={() => setBillModalOpen(true)} className="justify-start">
            <Receipt size={17} /> Add bill
          </Button>
          <Button variant="secondary" onClick={() => navigate('/budget')} className="justify-start">
            <PiggyBank size={17} /> Add budget
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Recent transactions</h2>
            <Link to="/transactions" className="text-sm font-medium text-moss hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">No transactions yet. Add your first one above.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{t.category}</p>
                    <p className="text-xs text-ink-muted">{t.date}</p>
                  </div>
                  <p
                    className={`shrink-0 pl-3 font-mono text-sm font-semibold tabular-nums ${
                      t.type === 'income' ? 'text-moss' : 'text-clay'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '−'}
                    {formatCurrency(t.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Spending by category</h2>
          {stats.topCategories.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">Add some expenses this month to see a breakdown.</p>
          ) : (
            <div className="space-y-3">
              {stats.topCategories.map(([cat, amount]) => (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-ink">{cat}</span>
                    <span className="font-mono tabular-nums text-ink-muted">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-moss-soft">
                    <div
                      className="h-full rounded-full bg-clay"
                      style={{ width: `${Math.max(6, (amount / stats.maxCategory) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink">Upcoming bills</h2>
            <Link to="/bills" className="text-sm font-medium text-moss hover:underline">
              View all
            </Link>
          </div>
          {upcomingBills.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">
              No unpaid bills.{' '}
              <Link to="/bills" className="font-medium text-moss hover:underline">
                Add a bill
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {upcomingBills.map((bill) => (
                <li key={bill.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{bill.name}</p>
                    <p className={`text-xs ${bill.dueDate < today ? 'text-clay' : 'text-ink-muted'}`}>
                      Due {bill.dueDate}
                    </p>
                  </div>
                  <p className="shrink-0 pl-3 font-mono text-sm font-semibold tabular-nums text-ink">
                    {formatCurrency(bill.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Budget progress</h2>
          {budget.overallAmount === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">Set a monthly budget to track progress here.</p>
          ) : (
            <>
              <div className="h-2.5 overflow-hidden rounded-full bg-moss-soft">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${overallRemaining < 0 ? 'bg-clay' : 'bg-moss'}`}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                {formatCurrency(stats.monthExpense)} spent of {formatCurrency(budget.overallAmount)}
              </p>
            </>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Monthly cash flow</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs text-ink-muted">Income</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-moss-soft">
                <div
                  className="h-full rounded-full bg-moss"
                  style={{ width: `${cashFlowTotal === 0 ? 0 : (stats.monthIncome / cashFlowTotal) * 100}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-right font-mono text-xs tabular-nums text-ink-muted">
                {formatCurrency(stats.monthIncome)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs text-ink-muted">Expenses</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-clay-soft">
                <div
                  className="h-full rounded-full bg-clay"
                  style={{ width: `${cashFlowTotal === 0 ? 0 : (stats.monthExpense / cashFlowTotal) * 100}%` }}
                />
              </div>
              <span className="w-24 shrink-0 text-right font-mono text-xs tabular-nums text-ink-muted">
                {formatCurrency(stats.monthExpense)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <TransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleAddTransaction} defaultType={modalType} />
      <BillModal open={billModalOpen} onClose={() => setBillModalOpen(false)} onSave={handleAddBill} />
    </div>
  );
}
