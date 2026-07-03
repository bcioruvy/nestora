import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useBudget } from '../hooks/useBudget';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../lib/format';
import { exportToCSV, exportToExcel } from '../lib/export';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import type { Transaction } from '../types';

type ReportType = 'summary' | 'income' | 'expense' | 'budget';

const REPORT_LABELS: Record<ReportType, string> = {
  summary: 'Monthly Financial Report',
  income: 'Income Report',
  expense: 'Expense Report',
  budget: 'Budget Report',
};

function buildRows(
  type: ReportType,
  month: string,
  transactions: Transaction[],
  categoryAmounts: Record<string, number>,
): Record<string, string | number>[] {
  if (type === 'budget') {
    const spent: Record<string, number> = {};
    for (const t of transactions) {
      if (t.type === 'expense' && t.date?.startsWith(month)) {
        spent[t.category] = (spent[t.category] ?? 0) + t.amount;
      }
    }
    return Object.entries(categoryAmounts).map(([category, budgeted]) => ({
      Category: category,
      Budgeted: budgeted,
      Spent: spent[category] ?? 0,
      Remaining: budgeted - (spent[category] ?? 0),
    }));
  }

  const filtered = transactions.filter((t) => {
    if (!t.date?.startsWith(month)) return false;
    if (type === 'income') return t.type === 'income';
    if (type === 'expense') return t.type === 'expense';
    return true;
  });

  return filtered.map((t) => ({
    Date: t.date,
    Type: t.type,
    Category: t.category,
    Amount: t.amount,
    'Payment Method': t.paymentMethod,
    Notes: t.notes || '',
  }));
}

export default function Settings() {
  const { user, resetPassword, signOutUser } = useAuth();
  const { transactions } = useTransactions();
  const { budget } = useBudget();
  const { showToast } = useToast();
  const [sent, setSent] = useState(false);

  const now = new Date();
  const [reportMonth, setReportMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [reportType, setReportType] = useState<ReportType>('summary');

  const rows = useMemo(
    () => buildRows(reportType, reportMonth, transactions, budget.categoryAmounts || {}),
    [reportType, reportMonth, transactions, budget],
  );

  const reportFilename = `nestora-${reportType}-${reportMonth}`;

  async function handlePasswordReset() {
    if (user?.email) {
      await resetPassword(user.email);
      setSent(true);
    }
  }

  function handleDownloadCSV() {
    if (rows.length === 0) {
      showToast('No data for this report yet', 'error');
      return;
    }
    exportToCSV(reportFilename, rows);
    showToast('CSV downloaded');
  }

  function handleDownloadExcel() {
    if (rows.length === 0) {
      showToast('No data for this report yet', 'error');
      return;
    }
    exportToExcel(reportFilename, REPORT_LABELS[reportType], rows);
    showToast('Excel file downloaded');
  }

  function handlePrint() {
    if (rows.length === 0) {
      showToast('No data for this report yet', 'error');
      return;
    }
    window.print();
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const total =
    reportType !== 'budget'
      ? rows.reduce((sum, r) => sum + (typeof r.Amount === 'number' ? r.Amount : 0), 0)
      : undefined;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="no-print font-display text-2xl font-semibold text-ink">Settings</h1>

      <Card className="no-print">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-ink-muted">Name</span>
            <span className="font-medium text-ink">{user?.displayName || '—'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-ink-muted">Email</span>
            <span className="font-medium text-ink">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Currency</span>
            <span className="font-medium text-ink">PKR</span>
          </div>
        </div>
      </Card>

      <Card className="no-print">
        <h2 className="mb-2 font-display text-lg font-semibold text-ink">Password</h2>
        <p className="mb-4 text-sm text-ink-muted">We&apos;ll email you a link to set a new password.</p>
        {sent ? (
          <p className="text-sm text-moss">Reset link sent to {user?.email}.</p>
        ) : (
          <Button variant="secondary" onClick={handlePasswordReset}>
            Send reset email
          </Button>
        )}
      </Card>

      <Card className="no-print">
        <h2 className="mb-1 font-display text-lg font-semibold text-ink">Reports &amp; export</h2>
        <p className="mb-4 text-sm text-ink-muted">Generate a report for any month and download it, or print it as a PDF.</p>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="month"
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          />
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="flex-1 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          >
            {(Object.keys(REPORT_LABELS) as ReportType[]).map((key) => (
              <option key={key} value={key}>
                {REPORT_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleDownloadCSV}>
            <Download size={15} /> CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownloadExcel}>
            <FileSpreadsheet size={15} /> Excel
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            <Printer size={15} /> Print / Save as PDF
          </Button>
        </div>
        {rows.length === 0 && (
          <p className="mt-3 text-xs text-ink-muted">No data for {REPORT_LABELS[reportType].toLowerCase()} in this month yet.</p>
        )}
      </Card>

      <Card className="no-print">
        <h2 className="mb-2 font-display text-lg font-semibold text-ink">More settings</h2>
        <p className="mb-4 text-sm text-ink-muted">
          Language, date format, and account deletion are coming in a later pass.
        </p>
        <Button variant="danger" onClick={() => signOutUser()}>
          Log out
        </Button>
      </Card>

      {/* Print-only report view: hidden on screen, shown only via @media print in index.css */}
      <div className="print-only">
        <h1 style={{ fontFamily: 'Archivo, sans-serif', fontSize: 22, marginBottom: 4 }}>Nestora</h1>
        <p style={{ marginBottom: 16, color: '#555' }}>
          {REPORT_LABELS[reportType]} — {reportMonth}
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} style={{ textAlign: 'left', borderBottom: '2px solid #333', padding: '6px 8px' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col} style={{ borderBottom: '1px solid #ddd', padding: '6px 8px' }}>
                    {typeof row[col] === 'number' ? formatCurrency(row[col] as number) : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {total !== undefined && (
          <p style={{ marginTop: 12, fontWeight: 600 }}>Total: {formatCurrency(total)}</p>
        )}
      </div>
    </div>
  );
}
