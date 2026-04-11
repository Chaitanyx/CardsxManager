"use client";

import { useState, useEffect, useCallback } from "react";
import type { Card, Transaction } from "../types";
import { getLocal, setLocal } from "../lib/storage";
import importedTransactions from "../data/imported/transactions.json";
import { maybeCreateAutoBackup } from "../lib/backupManager";

const STORAGE_KEY = "transactions";

function isValidStoredTransaction(tx: Partial<Transaction>) {
  return (
    typeof tx.id === "string" &&
    typeof tx.cardId === "string" &&
    typeof tx.merchant === "string" &&
    Number.isFinite(Number(tx.amount)) &&
    typeof tx.date === "string" &&
    tx.date.includes("T")
  );
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    const localTransactions = getLocal<Transaction[]>(STORAGE_KEY, []);
    if (localTransactions.length > 0 && localTransactions.every((tx) => isValidStoredTransaction(tx))) {
      setTransactions(localTransactions);
      maybeCreateAutoBackup(getLocal<Card[]>("cards", []), localTransactions);
      setLoading(false);
      return;
    }

    const seededTransactions = (importedTransactions as unknown as Array<Partial<Transaction>>).map((tx) => ({
      id: tx.id ?? crypto.randomUUID(),
      cardId: tx.cardId ?? tx.card_id ?? "",
      merchant: tx.merchant ?? "",
      amount: Number(tx.amount ?? 0),
      date: tx.date ?? new Date().toISOString(),
      category: tx.category ?? "Other",
      isRewardEligible: tx.isRewardEligible ?? tx.is_reward_eligible ?? false,
      rewardType: tx.rewardType ?? tx.reward_type ?? "cashback",
      rewardRate: tx.rewardRate ?? tx.reward_rate,
      rewardRateMode: tx.rewardRateMode ?? tx.reward_rate_mode,
      rewardUnit: tx.rewardUnit ?? tx.reward_unit,
      rewardEarned: tx.rewardEarned ?? tx.reward_earned,
      rewardPointValue: tx.rewardPointValue ?? tx.reward_point_value,
      status: tx.status ?? "unbilled",
      createdAt: tx.createdAt ?? tx.created_at ?? new Date().toISOString()
    }));
    if (seededTransactions.length > 0) {
      setLocal(STORAGE_KEY, seededTransactions);
      setTransactions(seededTransactions);
      maybeCreateAutoBackup(getLocal<Card[]>("cards", []), seededTransactions);
      setLoading(false);
      return;
    }

    setTransactions([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(
    async (newTransaction: Omit<Transaction, "id" | "created_at" | "user_id">) => {
      const transactionWithId: Transaction = {
        ...newTransaction,
        id: crypto.randomUUID(),
        user_id: "",
        created_at: new Date().toISOString(),
        description: ""
      };
      setTransactions((prev) => {
        const updated = [...prev, transactionWithId];
        setLocal(STORAGE_KEY, updated);
        maybeCreateAutoBackup(getLocal<Card[]>("cards", []), updated);
        return updated;
      });
    },
    []
  );

  const updateTransaction = useCallback(async (updatedTransaction: Transaction) => {
    setTransactions((prev) => {
      const updated = prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t));
      setLocal(STORAGE_KEY, updated);
      maybeCreateAutoBackup(getLocal<Card[]>("cards", []), updated);
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback(async (transactionId: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== transactionId);
      setLocal(STORAGE_KEY, updated);
      maybeCreateAutoBackup(getLocal<Card[]>("cards", []), updated);
      return updated;
    });
  }, []);

  const deleteTransactions = useCallback(async (transactionIds: string[]) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => !transactionIds.includes(t.id));
      setLocal(STORAGE_KEY, updated);
      maybeCreateAutoBackup(getLocal<Card[]>("cards", []), updated);
      return updated;
    });
  }, []);

  const replaceTransactions = useCallback(
    async (newTransactions: Transaction[]) => {
      setTransactions(newTransactions);
      setLocal(STORAGE_KEY, newTransactions);
      maybeCreateAutoBackup(getLocal<Card[]>("cards", []), newTransactions);
    },
    []
  );

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteTransactions,
    loading,
    error,
    refetch: fetchTransactions,
    replaceTransactions
  };
}
