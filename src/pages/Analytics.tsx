import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTransactions } from '../hooks/useTransactions';
import { useBudget } from '../hooks/useBudget';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../lib/format';
import Card from '../components/ui/Card';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PALETTE = {
  light: {
    moss: '#2E5E45',
    brass: '#B3812E',
    clay: '#A34F3D',
    grid: '#E8E3D8',
    text: '#6B6459',
    neutral: '#D6CFC0',
    pie: ['#2E5E45', '#B3812E', '#A34F3D', '#6B8F7A', '#D1A85C', '#C47B68'],
  },
  dark: {
    moss: '#6FAE85',
    brass: '#D9A84E',
    clay: '#D6816D',
    grid: '#34302A',
    text: '#A79E8E',
    neutral: '#4A443A',
    pie: ['#6FAE85', '#D9A84E', '#D6816D', '#8FC4A5', '#E8C57F', '#E29E8C'],
  },
} as const;

function monthKeyToLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTH_LABELS[m - 1]} ${y}`;
}

export default function Analytics() {
  const { transactions } = useTransactions();
  const { budget } = useBudget();
  const { goals } = useSavingsGoals();
  const { theme } = useTheme();
  const colors = PALETTE[theme];

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);

  const monthsRange = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months;
  }, [selectedMonth]);

  const trendData = useMemo(() => {
    return monthsRange.map((key) => {
      let income = 0;
      let expense = 0;
      for (const t of transactions) {
        if (t.date?.startsWith(key)) {
          if (t.type === 'income') income += t.amount;
          else expense += t.amount;
        }
      }
      return { month: monthKeyToLabel(key), income, expense };
    });
  }, [transactions, monthsRange]);

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type === 'expense' && t.date?.startsWith(selectedMonth)) {
        totals[t.category] = (totals[t.category] ?? 0) + t.amount;
      }
    }
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [transactions, selectedMonth]);

  const budgetUsageData = useMemo(() => {
    const spent: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type === 'expense' && t.date?.startsWith(selectedMonth)) {
        spent[t.category] = (spent[t.category] ?? 0) + t.amount;
      }
    }
    return Object.entries(budget.categoryAmounts || {}).map(([category, budgeted]) => ({
      category,
      budgeted,
      spent: spent[category] ?? 0,
    }));
  }, [transactions, budget, selectedMonth]);

  const savingsData = goals.map((g) => ({ name: g.name, target: g.targetAmount, saved: g.savedAmount }));
  const hasTransactions = transactions.length > 0;
  const currencyFormatter = (value: unknown) => formatCurrency(Number(value));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Analytics</h1>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
        />
      </div>

      {!hasTransactions ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="font-medium text-ink">Not enough data yet</p>
          <p className="max-w-sm text-sm text-ink-muted">
            Add a few transactions and charts will appear here automatically.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Monthly spending trend</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid stroke={colors.grid} vertical={false} />
                <XAxis dataKey="month" stroke={colors.text} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.text} fontSize={12} tickLine={false} axisLine={false} width={40} />
                <Tooltip formatter={currencyFormatter} contentStyle={{ borderRadius: 12, border: `1px solid ${colors.grid}` }} />
                <Line type="monotone" dataKey="expense" stroke={colors.clay} strokeWidth={2.5} dot={false} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Income vs expenses</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trendData}>
                <CartesianGrid stroke={colors.grid} vertical={false} />
                <XAxis dataKey="month" stroke={colors.text} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.text} fontSize={12} tickLine={false} axisLine={false} width={40} />
                <Tooltip formatter={currencyFormatter} contentStyle={{ borderRadius: 12, border: `1px solid ${colors.grid}` }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" fill={colors.moss} name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill={colors.clay} name="Expenses" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Spending by category</h2>
            {categoryData.length === 0 ? (
              <p className="py-16 text-center text-sm text-ink-muted">No expenses in this month yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={colors.pie[i % colors.pie.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={currencyFormatter} contentStyle={{ borderRadius: 12, border: `1px solid ${colors.grid}` }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Budget usage</h2>
            {budgetUsageData.length === 0 ? (
              <p className="py-16 text-center text-sm text-ink-muted">Set category budgets to see usage here.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={budgetUsageData} layout="vertical" margin={{ left: 12 }}>
                  <CartesianGrid stroke={colors.grid} horizontal={false} />
                  <XAxis type="number" stroke={colors.text} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="category" stroke={colors.text} fontSize={11} width={110} tickLine={false} axisLine={false} />
                  <Tooltip formatter={currencyFormatter} contentStyle={{ borderRadius: 12, border: `1px solid ${colors.grid}` }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="budgeted" fill={colors.neutral} name="Budgeted" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="spent" fill={colors.clay} name="Spent" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Savings by goal</h2>
            {savingsData.length === 0 ? (
              <p className="py-16 text-center text-sm text-ink-muted">
                Create a savings goal on the Budget page to see progress here.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={savingsData}>
                  <CartesianGrid stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="name" stroke={colors.text} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={colors.text} fontSize={12} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={currencyFormatter} contentStyle={{ borderRadius: 12, border: `1px solid ${colors.grid}` }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="target" fill={colors.neutral} name="Target" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saved" fill={colors.brass} name="Saved" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
