"use client";

import React from "react";
import { BankCardData } from "../../types";

export function RewardsCap({ cardData }: { cardData?: BankCardData }) {
  if (!cardData || !cardData.rewardStructure?.accelerated || cardData.rewardStructure.accelerated.length === 0) return null;

  const acceleratedRewards = cardData.rewardStructure.accelerated;
  const hasAnyCap =
    acceleratedRewards.some((reward) => reward.cap !== undefined || reward.capNote) ||
    cardData.rewardStructure.baseCap !== undefined ||
    Boolean(cardData.rewardStructure.baseCapNote);

  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Accelerated Rewards & Caps</h3>
      <div className="space-y-4">
        {acceleratedRewards.map((reward, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-neutral-600 font-medium capitalize">{reward.category}</span>
            <div className="text-right">
              <span className="font-semibold text-emerald-600">
                {reward.unit === "percent" || reward.unit === "%" 
                  ? `${reward.rate}%` 
                  : `${reward.rate}x ${reward.unit}`}
              </span>
              {reward.capNote ? (
                <div className="text-xs font-medium text-neutral-500">{reward.capNote}</div>
              ) : reward.cap !== undefined ? (
                <div className="text-xs font-medium text-neutral-500">Cap ₹{reward.cap.toLocaleString("en-IN")}</div>
              ) : null}
            </div>
          </div>
        ))}

        {hasAnyCap && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-600 font-medium">Base Spends</span>
            <div className="text-right">
              <span className="font-semibold text-emerald-600">{cardData.rewardStructure.baseRate}% Cashback</span>
              {cardData.rewardStructure.baseCapNote ? (
                <div className="text-xs font-medium text-neutral-500">{cardData.rewardStructure.baseCapNote}</div>
              ) : cardData.rewardStructure.baseCap !== undefined ? (
                <div className="text-xs font-medium text-neutral-500">Cap ₹{cardData.rewardStructure.baseCap.toLocaleString("en-IN")}</div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}