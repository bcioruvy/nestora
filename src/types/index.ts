export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO date string, e.g. 2026-07-01
  paymentMethod: string;
  notes?: string;
  tags?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  currency: string;
  createdAt?: any;
}

export const INCOME_CATEGORIES = [
  'Salary',
  'Gift Received',
  'Refund',
  'Investment Return',
  'Bonus',
  'Freelance',
  'Family',
  'Transfer',
  'Other Income',
] as const;

export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Vegetables & Fruits',
  'Meat & Poultry',
  'Utility',
  'Internet',
  'Mobile Bill',
  'Rent',
  'Home Maintenance',
  'Healthcare',
  'Education',
  'Transportation',
  'Fuel',
  'Dining Out',
  'Shopping',
  'Entertainment',
  'Charity',
  'Gifts Given',
  'Miscellaneous',
  'Other',
] as const;

export const PAYMENT_METHODS = [
  'Cash',
  'Bank Transfer',
  'Debit Card',
  'Credit Card',
  'Mobile Wallet',
  'Cheque',
  'Other',
] as const;

export type BillRecurrence = 'none' | 'weekly' | 'monthly' | 'yearly';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date
  recurrence: BillRecurrence;
  status: 'paid' | 'unpaid';
  createdAt?: any;
  updatedAt?: any;
}

export interface BudgetConfig {
  overallAmount: number;
  categoryAmounts: Record<string, number>;
  updatedAt?: any;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string; // ISO date, optional
  createdAt?: any;
  updatedAt?: any;
}

export const COMMON_BILL_NAMES = [
  'Electricity',
  'Gas',
  'Water',
  'Internet',
  'Mobile',
  'Rent',
  'Streaming Services',
  'Insurance',
] as const;

export const SAVINGS_GOAL_SUGGESTIONS = [
  'Emergency Fund',
  'Vacation',
  'New Phone',
  'New Furniture',
  'Home Renovation',
] as const;
