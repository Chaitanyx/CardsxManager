import { CardType, Transaction } from "../types";

const numberFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

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
    return `+₹${formatNumber(value)} cashback`;
  }

  if (rewardType === "miles") {
    return `+${formatNumber(value)} miles`;
  }

  return `+${formatNumber(value)} points`;
}

export function getRewardRupeeEquivalent(tx: Transaction) {
  if (tx.rewardType !== "rewards") return null;
  const pointValue = tx.rewardPointValue ?? 0;
  const rewardEarned = tx.rewardEarned ?? 0;
  if (pointValue <= 0 || rewardEarned <= 0) return null;

  const rupeeValue = rewardEarned * pointValue;
  return `+₹${formatNumber(rupeeValue)}`;
}

export function formatTransactionReward(tx: Transaction) {
  return formatRewardEarned(tx.rewardEarned ?? 0, tx.rewardType);
}