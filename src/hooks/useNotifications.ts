import { useMemo } from 'react';
import { useBills } from './useBills';
import { useBudget } from './useBudget';
import { useTransactions } from './useTransactions';
import { useSavingsGoals } from './useSavingsGoals';
import { formatCurrency } from '../lib/format';

export interface AppNotification {
  id: string;
  type: 'bill' | 'budget' | 'goal' | 'summary';
  message: string;
  severity: 'info' | 'warning';
}

export function useNotifications() {
  const { bills } = useBills();
  const { budget } = useBudget();
  const { transactions } = useTransactions();
  const { goals } = useSavingsGoals();

  const notifications = useMemo(() => {
    const list: AppNotification[] = [];
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const in7Key = new Date(today.getTime() + 7 * 86400000).toISOString().slice(0, 10);

    for (const bill of bills) {
      if (bill.status !== 'unpaid') continue;
      if (bill.dueDate < todayKey) {
        list.push({ id: `bill-overdue-${bill.id}`, type: 'bill', severity: 'warning', message: `${bill.name} is overdue` });
      } else if (bill.dueDate <= in7Key) {
        list.push({ id: `bill-soon-${bill.id}`, type: 'bill', severity: 'info', message: `${bill.name} is due ${bill.dueDate}` });
      }
    }

    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const categorySpend: Record<string, number> = {};
    let monthExpense = 0;
    let monthIncome = 0;
    for (const t of transactions) {
      if (t.date?.startsWith(monthKey)) {
        if (t.type === 'expense') {
          categorySpend[t.category] = (categorySpend[t.category] ?? 0) + t.amount;
          monthExpense += t.amount;
        } else {
          monthIncome += t.amount;
        }
      }
    }

    if (budget.overallAmount > 0 && monthExpense > budget.overallAmount) {
      list.push({
        id: 'budget-overall',
        type: 'budget',
        severity: 'warning',
        message: "You're over your overall monthly budget",
      });
    }

    for (const [category, limit] of Object.entries(budget.categoryAmounts || {})) {
      const spent = categorySpend[category] ?? 0;
      if (spent > limit) {
        list.push({ id: `budget-${category}`, type: 'budget', severity: 'warning', message: `${category} is over its budget` });
      }
    }

    for (const goal of goals) {
      if (!goal.deadline || goal.deadline < todayKey) continue;
      const pct = goal.targetAmount > 0 ? goal.savedAmount / goal.targetAmount : 0;
      const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - today.getTime()) / 86400000);
      if (daysLeft <= 30 && pct < 0.9) {
        list.push({
          id: `goal-${goal.id}`,
          type: 'goal',
          severity: 'info',
          message: `${goal.name} is ${(pct * 100).toFixed(0)}% funded with ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`,
        });
      }
    }

    if (monthIncome > 0 || monthExpense > 0) {
      list.push({
        id: 'monthly-summary',
        type: 'summary',
        severity: 'info',
        message: `This month so far: ${formatCurrency(monthIncome)} in, ${formatCurrency(monthExpense)} out`,
      });
    }

    return list;
  }, [bills, budget, transactions, goals]);

  return { notifications };
}
