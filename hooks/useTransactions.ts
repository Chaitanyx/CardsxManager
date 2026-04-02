import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { getStoredTransactions, saveTransactions } from '../lib/storage';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(getStoredTransactions());
  }, []);

  const addTransaction = (transaction: Transaction) => {
    const updated = [...transactions, transaction];
    setTransactions(updated);
    saveTransactions(updated);
  };

  const markAsPaid = (cardId: string, transactionIds: string[]) => {
    const updated = transactions.map((t) =>
      t.cardId === cardId && transactionIds.includes(t.id) ? { ...t, status: 'paid' as const } : t
    );
    setTransactions(updated);
    saveTransactions(updated);
  };

  const removeTransactions = (transactionIds: string[]) => {
    const idSet = new Set(transactionIds);
    const updated = transactions.filter((t) => !idSet.has(t.id));
    setTransactions(updated);
    saveTransactions(updated);
  };

  const removeTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx));
    setTransactions(updated);
    saveTransactions(updated);
  };

  const replaceTransactions = (nextTransactions: Transaction[]) => {
    setTransactions(nextTransactions);
    saveTransactions(nextTransactions);
  };

  return {
    transactions,
    addTransaction,
    markAsPaid,
    removeTransactions,
    removeTransaction,
    updateTransaction,
    replaceTransactions
  };
}
