export type CardType = "cashback" | "rewards" | "miles";

export type CardNetwork = "Visa" | "Mastercard" | "RuPay" | "Amex" | "Diners Club";

export type RewardRateMode = "percent" | "multiplier" | "perCurrency";

export type RewardUnit = "cashback" | "points" | "miles";

export interface BankCardRewardRule {
  category: string;
  rate: number;
  unit: string;
}

export interface BankCardData {
  id: string;
  bank: string;
  name: string;
  type: CardType;
  color: [string, string];
  annualFee: number;
  statementDate: number;
  gracePeriodDays: number;
  preferredNetwork: CardNetwork;
  preferredSubNetwork: string;
  networks?: CardNetwork[];
  subNetworks?: Partial<Record<CardNetwork, string[]>>;
  rewardStructure: {
    baseRate?: number;
    pointValue?: number;
    accelerated?: BankCardRewardRule[];
  };
}

export interface UserCard {
  id: string;
  bankCardId: string;
  bank: string;
  name: string;
  type: CardType;
  network: CardNetwork;
  subNetwork: string;
  statementDate: number;
  gracePeriodDays: number;
  dueDate: number;
  creditLimit: number;
  annualFee: number;
  isLtf: boolean;
  annualFeeWaiverTarget: number;
  includePastCumulativeSpend: boolean;
  pastCumulativeSpend: number;
  renewalMonth: string;
  color: [string, string];
  createdAt: string;
  last4?: string;
  sharedLimitGroupId?: string;

  // Backward-compatible aliases used in some migrated screens.
  bank_card_id?: string;
  card_type?: CardType;
  statement_date?: number;
  grace_period_days?: number;
  credit_limit?: number;
  annual_fee?: number;
  is_ltf?: boolean;
  annual_fee_waiver_target?: number;
  include_past_cumulative_spend?: boolean;
  past_cumulative_spend?: number;
  sub_network?: string;
  last_4_digits?: string;
  created_at?: string;
  renewal_month?: string;

  // Legacy DB fields that may still exist in local storage snapshots.
  user_id?: string;
  bank_name?: string;
  card_name?: string;
  card_number?: string;
  expiry_date?: string;
  cvv?: string;
}

export type Card = UserCard;

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  date: string;
  cardId: string;
  rewardType: CardType;
  status: "unbilled" | "billed" | "paid";
  isRewardEligible: boolean;
  createdAt: string;

  rewardRate?: number;
  rewardRateMode?: RewardRateMode;
  rewardUnit?: RewardUnit;
  rewardEarned?: number;
  rewardPointValue?: number;
  description?: string;

  // Backward-compatible aliases used in some migrated screens.
  card_id?: string;
  user_id?: string;
  created_at?: string;
  reward_type?: CardType;
  is_reward_eligible?: boolean;
  reward_rate?: number;
  reward_rate_mode?: RewardRateMode;
  reward_unit?: RewardUnit;
  reward_earned?: number;
  reward_point_value?: number;
}

