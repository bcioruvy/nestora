import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import type { BudgetConfig } from '../types';

const EMPTY_BUDGET: BudgetConfig = { overallAmount: 0, categoryAmounts: {} };

export function useBudget() {
  const { user } = useAuth();
  const [budget, setBudget] = useState<BudgetConfig>(EMPTY_BUDGET);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBudget(EMPTY_BUDGET);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Lives inside the already-secured "budgets" subcollection as a single
    // fixed-id document, so no firestore.rules changes are needed for this.
    const ref = doc(db, 'users', user.uid, 'budgets', 'config');
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setBudget(snap.exists() ? (snap.data() as BudgetConfig) : EMPTY_BUDGET);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load budget', error);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [user]);

  async function saveBudget(data: Omit<BudgetConfig, 'updatedAt'>) {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'budgets', 'config');
    await setDoc(ref, { ...data, updatedAt: serverTimestamp() });
  }

  return { budget, loading, saveBudget };
}
