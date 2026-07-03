import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import type { Transaction } from '../types';

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'users', user.uid, 'transactions'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction);
        setTransactions(items);
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load transactions', error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  async function addTransaction(data: Omit<Transaction, 'id'>) {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function updateTransaction(id: string, data: Partial<Omit<Transaction, 'id'>>) {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'transactions', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async function removeTransaction(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
  }

  return { transactions, loading, addTransaction, updateTransaction, removeTransaction };
}
