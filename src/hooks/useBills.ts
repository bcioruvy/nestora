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
import type { Bill } from '../types';

export function useBills() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBills([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'users', user.uid, 'bills'), orderBy('dueDate', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setBills(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Bill));
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load bills', error);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [user]);

  async function addBill(data: Omit<Bill, 'id'>) {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'bills'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function updateBill(id: string, data: Partial<Omit<Bill, 'id'>>) {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'bills', id), { ...data, updatedAt: serverTimestamp() });
  }

  async function removeBill(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'bills', id));
  }

  async function toggleBillStatus(id: string, status: 'paid' | 'unpaid') {
    await updateBill(id, { status });
  }

  return { bills, loading, addBill, updateBill, removeBill, toggleBillStatus };
}
