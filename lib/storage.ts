import { Card, Transaction } from '../types';
import creditCardsData from '../data/creditCards';

export const STORAGE_KEYS = {
  CARDS: 'cardx_cards',
  TRANSACTIONS: 'cardx_transactions',
};

function getUserScopedStorageKey(baseKey: string, userId?: string) {
  return userId ? `${baseKey}_${userId}` : baseKey;
}

export function normalizeCard(card: Card): Card {
  const bankCard = (creditCardsData as Array<{ id: string; color: [string, string] }>).find(
    (item) => item.id === card.bankCardId
  );
  const normalizedAnnualFee =
    typeof card.annualFee === "number" && Number.isFinite(card.annualFee)
      ? Math.max(card.annualFee, 0)
      : 0;
  const normalizedIsLtf = card.isLtf ?? normalizedAnnualFee === 0;
  const defaultWaiverTarget = normalizedIsLtf ? 0 : Math.max(normalizedAnnualFee * 100, 0);
  const normalizedWaiverTarget =
    typeof card.annualFeeWaiverTarget === "number" && Number.isFinite(card.annualFeeWaiverTarget)
      ? Math.max(card.annualFeeWaiverTarget, 0)
      : defaultWaiverTarget;
  const normalizedPastCumulativeSpend =
    typeof card.pastCumulativeSpend === "number" && Number.isFinite(card.pastCumulativeSpend)
      ? Math.max(card.pastCumulativeSpend, 0)
      : 0;
  const normalizedRenewalMonth =
    typeof card.renewalMonth === "string" && /^\d{4}-\d{2}$/.test(card.renewalMonth)
      ? card.renewalMonth
      : card.created_at?.slice(0, 7) ?? new Date().toISOString().slice(0, 7);

  const normalizedLast4 = (card.last4 ?? card.id.slice(-4) ?? "0000")
    .replace(/\D/g, "")
    .slice(-4)
    .padStart(4, "0");

  return {
    ...card,
    last4: normalizedLast4,
    gracePeriodDays: card.gracePeriodDays ?? 20,
    dueDate: card.dueDate ?? 0,
    annualFee: normalizedAnnualFee,
    isLtf: normalizedIsLtf,
    annualFeeWaiverTarget: normalizedIsLtf ? 0 : normalizedWaiverTarget,
    includePastCumulativeSpend: card.includePastCumulativeSpend ?? false,
    pastCumulativeSpend: normalizedPastCumulativeSpend,
    renewalMonth: normalizedRenewalMonth,
    sharedLimitGroupId: card.sharedLimitGroupId ?? undefined,
    color: bankCard?.color ?? card.color,
  };
}

export function normalizeStoredCards(cards: Card[]): Card[] {
  return cards.map(normalizeCard);
}

export function normalizeStoredTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map((tx) => ({
    ...tx,
    status: tx.status ?? 'unbilled',
    created_at: tx.created_at ?? new Date().toISOString(),
  }));
}

export function getStoredCards(userId?: string): Card[] {
  if (typeof window === 'undefined') return [];
  const scopedKey = getUserScopedStorageKey(STORAGE_KEYS.CARDS, userId);
  const stored = localStorage.getItem(scopedKey);
  return stored ? normalizeStoredCards(JSON.parse(stored) as Card[]) : [];
}

export function saveCards(cards: Card[], userId?: string) {
  if (typeof window !== 'undefined') {
    const scopedKey = getUserScopedStorageKey(STORAGE_KEYS.CARDS, userId);
    localStorage.setItem(scopedKey, JSON.stringify(cards));
  }
}

export function getStoredTransactions(userId?: string): Transaction[] {
  if (typeof window === 'undefined') return [];
  const scopedKey = getUserScopedStorageKey(STORAGE_KEYS.TRANSACTIONS, userId);
  const stored = localStorage.getItem(scopedKey);
  return stored ? normalizeStoredTransactions(JSON.parse(stored) as Transaction[]) : [];
}

export function saveTransactions(transactions: Transaction[], userId?: string) {
  if (typeof window !== 'undefined') {
    const scopedKey = getUserScopedStorageKey(STORAGE_KEYS.TRANSACTIONS, userId);
    localStorage.setItem(scopedKey, JSON.stringify(transactions));
  }
}

export function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  const value = localStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : defaultValue;
}

export function setLocal<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
