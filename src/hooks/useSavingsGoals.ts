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
import type { SavingsGoal } from '../types';

export function useSavingsGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, 'users', user.uid, 'savingsGoals'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setGoals(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as SavingsGoal));
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load savings goals', error);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [user]);

  async function addGoal(data: Omit<SavingsGoal, 'id'>) {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'savingsGoals'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function updateGoal(id: string, data: Partial<Omit<SavingsGoal, 'id'>>) {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'savingsGoals', id), { ...data, updatedAt: serverTimestamp() });
  }

  async function removeGoal(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'savingsGoals', id));
  }

  return { goals, loading, addGoal, updateGoal, removeGoal };
}
