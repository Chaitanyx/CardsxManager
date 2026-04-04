"use client";

import React from "react";
import Link from "next/link";
import { CardType, UserCard } from "../../types";
import { SharedLimitSummary } from "../../lib/limitSharing";
import { CreditCard, Nfc, WifiHigh } from "lucide-react";

export function CardIllustration({
  card,
  cardType,
  annualFee = 0,
  isLtf = false,
  unbilledTotal,
  billedTotal,
  totalRewardsReceived = 0,
  showDetailedStats = false,
  sharedLimitSummary,
  onAddSpend,
  onClearDues,
  isClearing = false,
  showPaid = false
}: {
  card: UserCard;
  cardType: CardType;
  annualFee?: number;
  isLtf?: boolean;
  unbilledTotal: number;
  billedTotal: number;
  totalRewardsReceived?: number;
  showDetailedStats?: boolean;
  sharedLimitSummary?: SharedLimitSummary;
  onAddSpend: () => void;
  onClearDues?: () => void;
  isClearing?: boolean;
  showPaid?: boolean;
}) {
  const availableCredit = sharedLimitSummary?.availableCredit ?? Math.max(card.creditLimit - unbilledTotal - billedTotal, 0);
  const limitTotal = sharedLimitSummary?.totalLimit ?? card.creditLimit;
  const utilization = limitTotal > 0 ? ((limitTotal - availableCredit) / limitTotal) * 100 : 0;
  const networkLabel = card.network === "Diners Club" ? "DINERS" : card.network.toUpperCase();
  const variantLabel = card.subNetwork?.toUpperCase() ?? "CLASSIC";
  const safeLast4 = (card.last4 ?? card.id.slice(-4)).replace(/\D/g, "").slice(-4).padStart(4, "0");
  const maskedNumber = `•••• •••• •••• ${safeLast4}`;
  const baseAnnualFee = isLtf ? 0 : Math.max(annualFee, 0);
  const annualFeeWithGst = baseAnnualFee * 1.18;
  const totalRewardsLabel = cardType === "cashback" ? "Total Cashback" : cardType === "miles" ? "Total Miles" : "Total Points";
  const cardTypeLabel = cardType === "cashback" ? "CASHBACK CARD" : cardType === "miles" ? "MILES CARD" : "REWARDS CARD";
  const totalRewardsValue =
    cardType === "cashback"
      ? `₹${totalRewardsReceived.toLocaleString("en-IN")}`
      : cardType === "miles"
      ? `${totalRewardsReceived.toLocaleString("en-IN")} miles`
      : `${totalRewardsReceived.toLocaleString("en-IN")} points`;

  return (
    <div className="glass-panel p-5 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300">
      <Link href={`/card/${card.id}`} className="block">
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden soft-ring min-h-[258px]"
          style={{ background: `linear-gradient(135deg, ${card.color[0]}, ${card.color[1]})` }}
        >
          <div className="absolute inset-0 opacity-45" style={{ background: "radial-gradient(circle at 86% 12%, rgba(255,255,255,0.48), transparent 42%)" }} />
          <div className="absolute inset-0 opacity-25" style={{ background: "radial-gradient(circle at 10% 100%, rgba(0,0,0,0.3), transparent 46%)" }} />
          <div className="absolute left-0 right-0 top-0 h-16 opacity-55" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0))" }} />
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "repeating-linear-gradient(120deg, rgba(255,255,255,0.8) 0 1px, transparent 1px 6px)" }} />
          <div className="absolute bottom-4 right-4 h-24 w-24 rounded-full bg-white/12 blur-2xl" />
          <div className="absolute left-6 top-20 h-16 w-16 rounded-full bg-black/10 blur-2xl" />
          <div className="absolute right-4 top-4 text-right text-white/75 drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]">
            <div className="text-[8px] font-semibold uppercase tracking-[0.32em]">{networkLabel}</div>
            <div className="mt-1 text-[7px] font-medium uppercase tracking-[0.32em] opacity-80">{variantLabel}</div>
          </div>
          {billedTotal > 0 && (
            <div className="absolute top-14 right-4 rounded-full bg-white/25 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
              Statement Due
            </div>
          )}
          {(isClearing || showPaid) && (
            <div className={`absolute inset-0 flex items-center justify-center ${showPaid ? "paid-glow" : ""}`}>
              <div
                className={`rounded-full px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  isClearing
                    ? "bg-white/80 text-emerald-700"
                    : "bg-emerald-500/25 text-emerald-100"
                }`}
              >
                {isClearing ? "Payment Processing" : "Statement Paid"}
              </div>
            </div>
          )}
          <div className="relative z-10 flex h-full min-h-[206px] flex-col justify-between">
            <div>
              <div className="text-lg font-semibold tracking-tight">{card.bank}</div>
              <div className="mt-4 max-w-[88%] text-2xl font-semibold leading-[1.15]">{card.name}</div>
            </div>
            <div>
              <div className="text-xs tracking-[0.28em] opacity-80">{maskedNumber}</div>
              <div className="mt-6 flex items-end justify-between gap-4">
                <div className="flex items-end gap-3">
                  <div className="relative h-12 w-16 overflow-hidden rounded-xl border border-white/30 bg-white/12 backdrop-blur-[1px] shadow-[0_10px_18px_rgba(15,23,42,0.12)]">
                    <div className="absolute inset-0 opacity-60" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.32), rgba(255,255,255,0.06))" }} />
                    <div className="absolute left-2 top-2 grid grid-cols-2 gap-1.5">
                      <span className="h-2.5 w-3.5 rounded-sm border border-white/35 bg-white/18" />
                      <span className="h-2.5 w-3.5 rounded-sm border border-white/35 bg-white/18" />
                      <span className="h-2.5 w-3.5 rounded-sm border border-white/35 bg-white/18" />
                      <span className="h-2.5 w-3.5 rounded-sm border border-white/35 bg-white/18" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-4 bg-white/10" />
                  </div>
                  <div className="flex flex-col gap-1 pb-1">
                    <CreditCard className="h-4 w-4 opacity-80" />
                    <div className="flex items-center gap-1.5 opacity-85">
                      <WifiHigh className="h-4 w-4" />
                      <Nfc className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/60">
                    {cardTypeLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between text-sm text-neutral-600">
        <span>Available Credit</span>
        <span className="font-semibold text-neutral-800">₹{availableCredit.toLocaleString("en-IN")}</span>
      </div>
      {sharedLimitSummary?.sharedLimitEnabled && (
        <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-xs text-neutral-600">
          Shared limit across {sharedLimitSummary.memberCards.length} cards
        </div>
      )}
      <div className="h-2 rounded-full bg-white/80 overflow-hidden">
        <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(utilization, 100)}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-neutral-500">
        <div className="glass-panel-strong px-3 py-2">
          <div>Unbilled</div>
          <div className="text-sm font-semibold text-neutral-800">₹{unbilledTotal.toLocaleString("en-IN")}</div>
        </div>
        <div className="glass-panel-strong px-3 py-2">
          <div>Statement</div>
          <div className={`text-sm font-semibold ${billedTotal > 0 ? "text-red-600" : "text-neutral-800"}`}>
            ₹{billedTotal.toLocaleString("en-IN")}
          </div>
        </div>
        {showDetailedStats && (
          <>
            <div className="glass-panel-strong px-3 py-2">
              <div>Annual Fee</div>
              <div className="text-sm font-semibold text-neutral-800">
                {isLtf ? "Free" : `₹${annualFeeWithGst.toLocaleString("en-IN")}`}
              </div>
              {!isLtf && <div className="text-[10px] text-neutral-500">incl. 18% GST</div>}
            </div>
            <div className="glass-panel-strong px-3 py-2">
              <div>{totalRewardsLabel}</div>
              <div className={`text-sm font-semibold ${totalRewardsReceived > 0 ? "text-emerald-600" : "text-neutral-800"}`}>
                {totalRewardsValue}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          onClick={onAddSpend}
          className="flex-1 rounded-full bg-neutral-900 text-white py-2 text-sm font-semibold"
        >
          Add Spend
        </button>
        {onClearDues && billedTotal > 0 && (
          <button
            onClick={onClearDues}
            className="flex-1 rounded-full border border-emerald-200 bg-emerald-50 py-2 text-sm font-semibold text-emerald-700"
          >
            Clear Dues
          </button>
        )}
      </div>
    </div>
  );
}
