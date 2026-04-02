import { UserCard, Transaction } from '../types';

export const STORAGE_KEYS = {
  CARDS: 'cardx_cards',
  TRANSACTIONS: 'cardx_transactions',
};

function normalizeCard(card: UserCard): UserCard {
  const normalizedLast4 = (card.last4 ?? card.id.slice(-4) ?? "0000")
    .replace(/\D/g, "")
    .slice(-4)
    .padStart(4, "0");

  return {
    ...card,
    last4: normalizedLast4,
    gracePeriodDays: card.gracePeriodDays ?? 20,
    dueDate: card.dueDate ?? 0,
    sharedLimitGroupId: card.sharedLimitGroupId ?? undefined,
  };
}

export function getStoredCards(): UserCard[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.CARDS);
  return stored ? (JSON.parse(stored) as UserCard[]).map(normalizeCard) : [];
}

export function saveCards(cards: UserCard[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }
}

export function getStoredTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return stored ? (JSON.parse(stored) as Transaction[]).map((tx) => ({
    ...tx,
    status: tx.status ?? 'unbilled',
    createdAt: tx.createdAt ?? new Date().toISOString(),
  })) : [];
}

export function saveTransactions(transactions: Transaction[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }
}
