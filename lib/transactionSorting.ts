import { Transaction } from "../types";

export type SpendSortOption = "newest" | "oldest" | "amount-desc" | "amount-asc";
export type RewardSortOption = "newest" | "oldest" | "earned-desc" | "earned-asc";

export const spendSortOptions: { value: SpendSortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount-desc", label: "Amount: High to Low" },
  { value: "amount-asc", label: "Amount: Low to High" }
];

export const rewardSortOptions: { value: RewardSortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "earned-desc", label: "Reward: High to Low" },
  { value: "earned-asc", label: "Reward: Low to High" }
];

function compareDates(a: Transaction, b: Transaction) {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

function compareMerchant(a: Transaction, b: Transaction) {
  return a.merchant.localeCompare(b.merchant);
}

export function sortSpendTransactions(transactions: Transaction[], sortBy: SpendSortOption) {
  return [...transactions].sort((a, b) => {
    if (sortBy === "newest") return compareDates(a, b) || compareMerchant(a, b);
    if (sortBy === "oldest") return -compareDates(a, b) || compareMerchant(a, b);

    const amountDifference = sortBy === "amount-desc" ? b.amount - a.amount : a.amount - b.amount;
    return amountDifference || compareDates(a, b) || compareMerchant(a, b);
  });
}

export function sortRewardTransactions(transactions: Transaction[], sortBy: RewardSortOption) {
  return [...transactions].sort((a, b) => {
    if (sortBy === "newest") return compareDates(a, b) || compareMerchant(a, b);
    if (sortBy === "oldest") return -compareDates(a, b) || compareMerchant(a, b);

    const aReward = a.rewardEarned ?? 0;
    const bReward = b.rewardEarned ?? 0;
    const rewardDifference = sortBy === "earned-desc" ? bReward - aReward : aReward - bReward;
    return rewardDifference || compareDates(a, b) || compareMerchant(a, b);
  });
}