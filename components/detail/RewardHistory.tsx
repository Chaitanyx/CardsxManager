"use client";

import React from "react";
import { CardType, Transaction } from "../../types";
import { format } from "date-fns";
import { formatRewardEarned, getRewardHistoryTitle, getRewardTotalLabel } from "../../lib/rewardDisplay";

export function RewardHistory({ transactions, cardType }: { transactions: Transaction[]; cardType: CardType }) {
  const rewards = transactions.filter(
    (tx) => tx.status !== "paid" && tx.isRewardEligible && (tx.rewardEarned ?? 0) > 0
  );
  const totalEarned = rewards.reduce((sum, tx) => sum + (tx.rewardEarned ?? 0), 0);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">{getRewardHistoryTitle(cardType)}</h3>
          <p className="text-xs text-neutral-500">{rewards.length} entries</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-neutral-500">{getRewardTotalLabel(cardType)}</p>
          <p className="text-sm font-semibold text-emerald-600">{formatRewardEarned(totalEarned, cardType).replace("+", "")}</p>
        </div>
      </div>
      <div className="space-y-3">
        {rewards.length === 0 && <p className="text-sm text-neutral-500">No earnings yet.</p>}
        {rewards.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
            <div>
              <div className="font-semibold">{tx.merchant}</div>
              <div className="text-xs text-neutral-500">{format(new Date(tx.date), "dd MMM yyyy")}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-emerald-600">{formatRewardEarned(tx.rewardEarned ?? 0, tx.rewardType)}</div>
              <div className="text-xs text-neutral-500">₹{tx.amount.toLocaleString("en-IN")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
