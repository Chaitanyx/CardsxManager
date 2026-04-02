import { Transaction, UserCard } from "../types";

export type SharedLimitSummary = {
  memberCards: UserCard[];
  sharedLimitGroupId: string | null;
  sharedLimitEnabled: boolean;
  totalLimit: number;
  usedLimit: number;
  availableCredit: number;
};

export function getSharedLimitMemberCards(cards: UserCard[], card: UserCard) {
  if (!card.sharedLimitGroupId) {
    return [card];
  }

  const memberCards = cards.filter((item) => item.sharedLimitGroupId === card.sharedLimitGroupId);
  return memberCards.length > 0 ? memberCards : [card];
}

export function getSharedLimitSummary(
  cards: UserCard[],
  transactions: Transaction[],
  card: UserCard
): SharedLimitSummary {
  const memberCards = getSharedLimitMemberCards(cards, card);
  const totalLimit = memberCards[0]?.creditLimit ?? card.creditLimit;
  const usedLimit = transactions
    .filter((tx) => memberCards.some((member) => member.id === tx.cardId) && tx.status !== "paid")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return {
    memberCards,
    sharedLimitGroupId: card.sharedLimitGroupId ?? null,
    sharedLimitEnabled: memberCards.length > 1,
    totalLimit,
    usedLimit,
    availableCredit: Math.max(totalLimit - usedLimit, 0)
  };
}