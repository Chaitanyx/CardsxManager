import { UserCard, Transaction } from '../types';
import creditCardsData from '../data/creditCards';

export const STORAGE_KEYS = {
  CARDS: 'cardx_cards',
  TRANSACTIONS: 'cardx_transactions',
};

function normalizeCard(card: UserCard): UserCard {
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
      : card.createdAt?.slice(0, 7) ?? new Date().toISOString().slice(0, 7);

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
