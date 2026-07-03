import { useState } from 'react';
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react';
import { useBills } from '../hooks/useBills';
import { formatCurrency } from '../lib/format';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ListSkeleton } from '../components/ui/Skeleton';
import BillModal from '../components/bills/BillModal';
import type { Bill } from '../types';

function isOverdue(bill: Bill) {
  return bill.status === 'unpaid' && bill.dueDate < new Date().toISOString().slice(0, 10);
}

export default function Bills() {
  const { bills, loading, addBill, updateBill, removeBill, toggleBillStatus } = useBills();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Bill | null>(null);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(bill: Bill) {
    setEditing(bill);
    setModalOpen(true);
  }
  async function handleSave(data: Omit<Bill, 'id'>) {
    if (editing) {
      await updateBill(editing.id, data);
      showToast('Bill updated');
    } else {
      await addBill(data);
      showToast('Bill added');
    }
  }
  async function handleDelete(id: string) {
    if (confirm('Delete this bill?')) {
      await removeBill(id);
      showToast('Bill deleted');
    }
  }
  async function handleToggle(bill: Bill) {
    await toggleBillStatus(bill.id, bill.status === 'paid' ? 'unpaid' : 'paid');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Bills</h1>
        <Button onClick={openAdd}>
          <Plus size={17} /> Add bill
        </Button>
      </div>

      <Card>
        {loading ? (
          <ListSkeleton rows={4} />
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brass-soft text-brass">
              <Receipt size={22} />
            </div>
            <div>
              <p className="font-medium text-ink">No bills yet</p>
              <p className="mt-1 max-w-sm text-sm text-ink-muted">
                Add electricity, internet, rent, or any recurring bill to track due dates and
                payment status.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {bills.map((bill) => (
              <li key={bill.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink">{bill.name}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        bill.status === 'paid'
                          ? 'bg-moss-soft text-moss'
                          : isOverdue(bill)
                            ? 'bg-clay-soft text-clay'
                            : 'bg-brass-soft text-brass'
                      }`}
                    >
                      {bill.status === 'paid' ? 'Paid' : isOverdue(bill) ? 'Overdue' : 'Unpaid'}
                    </span>
                  </div>
                  <p className="truncate text-xs text-ink-muted">
                    Due {bill.dueDate} · {bill.recurrence === 'none' ? 'One-time' : bill.recurrence}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-sm font-semibold tabular-nums text-ink">
                  {formatCurrency(bill.amount)}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => handleToggle(bill)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-moss hover:bg-moss-soft"
                  >
                    Mark {bill.status === 'paid' ? 'unpaid' : 'paid'}
                  </button>
                  <button onClick={() => openEdit(bill)} className="rounded-lg p-2 text-ink-muted hover:bg-moss-soft/60">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(bill.id)} className="rounded-lg p-2 text-clay hover:bg-clay-soft">
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <BillModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />
    </div>
  );
}
