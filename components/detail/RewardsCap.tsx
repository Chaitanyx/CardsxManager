"use client";

import React from "react";
import { BankCardData } from "../../types";

export function RewardsCap({ cardData }: { cardData?: BankCardData }) {
  if (!cardData || !cardData.rewardStructure?.accelerated || cardData.rewardStructure.accelerated.length === 0) return null;

  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">Accelerated Rewards & Caps</h3>
      <div className="space-y-4">
        {cardData.rewardStructure.accelerated.map((reward, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span className="text-neutral-600 font-medium capitalize">{reward.category}</span>
            <div className="text-right">
              <span className="font-semibold text-emerald-600">
                {reward.unit === "percent" || reward.unit === "%" 
                  ? `${reward.rate}%` 
                  : `${reward.rate}x ${reward.unit}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}