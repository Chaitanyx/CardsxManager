export type CardType = "cashback" | "rewards" | "miles";
export type CardNetwork = "Visa" | "Mastercard" | "RuPay" | "Amex" | "Diners Club";
export type RewardRateMode = "percent" | "multiplier" | "perCurrency";

export interface RewardStructure {
  baseRate: number;
  accelerated?: { category: string; rate: number; unit: string }[];
  pointValue: number;
  pointUnit: string;
  redemption?: string[];
}

export interface BankCardData {
  id: string;
  bank: string;
  name: string;
  type: CardType;
  preferredNetwork: CardNetwork;
  preferredSubNetwork: string;
  annualFee: number;
  joiningFee: number;
  rewardStructure: RewardStructure;
  statementDate: number;
  gracePeriodDays: number;
  color: [string, string];
  features: string[];
  networks: CardNetwork[];
  subNetworks: Record<string, string[]>;
  sources?: { title: string; url: string; accessedOn: string }[];
}

export interface UserCard {
  id: string;
  bankCardId: string;
  bank: string;
  name: string;
  last4: string;
  type: CardType;
  network: CardNetwork;
  subNetwork: string;
  statementDate: number;
  gracePeriodDays: number;
  dueDate: number;
  creditLimit: number;
  annualFee?: number;
  isLtf?: boolean;
  annualFeeWaiverTarget?: number;
  includePastCumulativeSpend?: boolean;
  pastCumulativeSpend?: number;
  renewalMonth?: string;
  sharedLimitGroupId?: string;
  color: [string, string];
  createdAt: string;
}

export interface Transaction {
  id: string;
  cardId: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  isRewardEligible: boolean;
  rewardType: CardType;
  rewardRate?: number;
  rewardRateMode?: RewardRateMode;
  rewardUnit?: string;
  rewardEarned?: number;
  rewardPointValue?: number;
  status: "unbilled" | "billed" | "paid";
  createdAt: string;
}
