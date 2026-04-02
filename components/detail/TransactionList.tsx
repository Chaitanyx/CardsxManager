"use client";

import React from "react";
import { Transaction } from "../../types";
import { format } from "date-fns";
import { EmptyState } from "../ui/EmptyState";
import { getCategoryMeta } from "../../lib/categoryMeta";
import { formatTransactionReward } from "../../lib/rewardDisplay";

export function TransactionList({
  title,
  transactions,
  isFading = false,
  onTransactionClick,
  activeTransactionId
}: {
  title: string;
  transactions: Transaction[];
  isFading?: boolean;
  onTransactionClick?: (transaction: Transaction) => void;
  activeTransactionId?: string;
}) {
  return (
    <div
      className={`glass-panel p-5 transition-opacity duration-300 ${
        isFading ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-sm text-neutral-500">{transactions.length} items</span>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 && (
          <EmptyState title="No transactions yet" subtitle="Add a spend to see your statement split." size="compact" />
        )}
        {transactions.map((tx) => {
          const meta = getCategoryMeta(tx.category);
          const CategoryIcon = meta.icon;

          return (
            <button
              key={tx.id}
              type="button"
              onClick={() => onTransactionClick?.(tx)}
              className={`flex w-full items-center justify-between rounded-2xl bg-white/70 px-4 py-3 text-left transition ${
                onTransactionClick ? "hover:bg-white" : ""
              } ${activeTransactionId === tx.id ? "ring-2 ring-blue-200" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                    meta.iconClassName
                  }`}
                >
                  <CategoryIcon className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-semibold">{tx.merchant}</div>
                  <div className="text-xs text-neutral-500">
                    {format(new Date(tx.date), "dd MMM yyyy, hh:mm a")} • {tx.category}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{tx.amount.toLocaleString("en-IN")}</div>
                {tx.isRewardEligible && tx.rewardEarned !== undefined && (
                  <div className="text-xs text-emerald-600">{formatTransactionReward(tx)}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
