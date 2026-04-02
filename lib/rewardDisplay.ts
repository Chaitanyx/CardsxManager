import { CardType, Transaction } from "../types";

export function getRewardTabLabel(cardType: CardType) {
  if (cardType === "cashback") return "Cashback";
  if (cardType === "miles") return "Miles";
  return "Rewards";
}

export function getRewardHistoryTitle(cardType: CardType) {
  if (cardType === "cashback") return "Cashback History";
  if (cardType === "miles") return "Miles History";
  return "Reward History";
}

export function getRewardTotalLabel(cardType: CardType) {
  if (cardType === "cashback") return "Total Cashback Received";
  if (cardType === "miles") return "Total Miles Earned";
  return "Total Points Earned";
}

export function formatRewardEarned(value: number, rewardType: CardType) {
  if (rewardType === "cashback") {
    return `+₹${value.toFixed(2)} cashback`;
  }

  if (rewardType === "miles") {
    return `+${value.toFixed(2)} miles`;
  }

  return `+${value.toFixed(2)} points`;
}

export function formatTransactionReward(tx: Transaction) {
  return formatRewardEarned(tx.rewardEarned ?? 0, tx.rewardType);
}