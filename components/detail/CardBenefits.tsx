"use client";

import React, { useMemo } from "react";
import { BadgeCheck, CalendarDays, Gift, Sparkles, type LucideIcon } from "lucide-react";
import { BankCardData, UserCard } from "../../types";

type BenefitCard = {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
};

function formatAnnualFee(card: UserCard, cardData: BankCardData | undefined) {
  const annualFee = card.annualFee ?? cardData?.annualFee ?? 0;

  if (card.isLtf || annualFee === 0) {
    return "Lifetime free";
  }

  return `₹${Math.round(annualFee * 1.18).toLocaleString("en-IN")} incl. GST`;
}

function formatRewardSummary(card: UserCard, cardData: BankCardData | undefined) {
  const rewardStructure = cardData?.rewardStructure;

  if (!rewardStructure) {
    return "Configured rewards";
  }

  if (card.type === "cashback") {
    const accelerator = rewardStructure.accelerated?.[0];

    if (accelerator) {
      return `${accelerator.rate}% on ${accelerator.category}`;
    }

    return `${rewardStructure.baseRate}% base cashback`;
  }

  if (card.type === "miles") {
    return `${rewardStructure.baseRate}x miles`;
  }

  const pointUnit = rewardStructure.pointUnit || "points";
  return `${rewardStructure.baseRate} ${pointUnit} base`;
}

function formatRedemptionSummary(cardData: BankCardData | undefined) {
  const redemptionOptions = cardData?.rewardStructure?.redemption ?? [];

  if (redemptionOptions.length > 0) {
    return redemptionOptions.slice(0, 2).join(" • ");
  }

  return "Flexible redemption options";
}

function formatCycleSummary(card: UserCard) {
  return `Statement day ${card.statementDate} · ${card.gracePeriodDays} day grace`;
}

export function CardBenefits({ card, cardData }: { card: UserCard; cardData: BankCardData | undefined }) {
  const benefitCards = useMemo<BenefitCard[]>(() => {
    const annualFee = card.annualFee ?? cardData?.annualFee ?? 0;
    const topFeature = cardData?.features?.[0] ?? "Bank-level perks";

    return [
      {
        icon: Sparkles,
        title: "Rewards",
        value: formatRewardSummary(card, cardData),
        description: topFeature
      },
      {
        icon: BadgeCheck,
        title: "Fee",
        value: formatAnnualFee(card, cardData),
        description: annualFee > 0 ? `Annual fee goal starts at ₹${annualFee.toLocaleString("en-IN")}` : "No annual fee commitment"
      },
      {
        icon: Gift,
        title: "Redemption",
        value: formatRedemptionSummary(cardData),
        description: cardData?.rewardStructure?.pointValue
          ? `1 ${cardData.rewardStructure.pointUnit} = ₹${cardData.rewardStructure.pointValue}`
          : "Value depends on the card's reward structure"
      },
      {
        icon: CalendarDays,
        title: "Cycle",
        value: formatCycleSummary(card),
        description: `${card.network} ${card.subNetwork}`
      }
    ];
  }, [card, cardData]);

  const features = cardData?.features ?? [];

  return (
    <div className="glass-panel p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Card Benefits</h3>
          <p className="text-sm text-neutral-500">A quick visual summary of what this card gives you.</p>
        </div>
        <div className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          {cardData?.bank ?? card.bank}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {benefitCards.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <div
              key={benefit.title}
              className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.05)]"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{benefit.title}</div>
                  <div className="text-sm text-neutral-500">At a glance</div>
                </div>
              </div>
              <div className="text-base font-semibold text-neutral-900">{benefit.value}</div>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{benefit.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Key Features
        </div>
        <div className="flex flex-wrap gap-2">
          {features.length > 0 ? (
            features.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-700"
              >
                {feature}
              </span>
            ))
          ) : (
            <span className="text-sm text-neutral-500">No feature list available for this card.</span>
          )}
        </div>
      </div>
    </div>
  );
}