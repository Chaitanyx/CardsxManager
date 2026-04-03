"use client";

import React, { useMemo, useState } from "react";
import creditCardsData from "../../data/creditCards";
import { BankCardData, Transaction, UserCard } from "../../types";
import { getCategoryMeta, spendCategories } from "../../lib/categoryMeta";
import { getRewardTabLabel } from "../../lib/rewardDisplay";

type RewardOption = {
  label: string;
  value: string;
  mode: "percent" | "multiplier" | "perCurrency";
  unit: "cashback" | "points" | "miles";
};

function calculateRewardEarned(amount: number, rate: number, rateMode: "percent" | "multiplier" | "perCurrency") {
  if (!rate || !amount) return 0;
  if (rateMode === "percent") {
    return (amount * rate) / 100;
  }
  if (rateMode === "multiplier") {
    return amount * rate;
  }
  return (amount / 100) * rate;
}

export default function AddSpendModal({
  card,
  onClose,
  onAdd
}: {
  card: UserCard;
  onClose: () => void;
  onAdd: (tx: Transaction) => void;
}) {
  const bankCard = useMemo(
    () => (creditCardsData as BankCardData[]).find((item) => item.id === card.bankCardId),
    [card.bankCardId]
  );

  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [category, setCategory] = useState(spendCategories[0]);
  const [isRewardEligible, setRewardEligible] = useState(true);
  const [rewardRate, setRewardRate] = useState<string>("");
  const [rewardRateMode, setRewardRateMode] = useState<"percent" | "multiplier" | "perCurrency">(
    card.type === "cashback" ? "percent" : "perCurrency"
  );
  const [rewardUnit, setRewardUnit] = useState(card.type === "cashback" ? "cashback" : card.type === "miles" ? "miles" : "points");
  const [rewardPointValue, setRewardPointValue] = useState(
    card.type === "rewards" ? String(bankCard?.rewardStructure?.pointValue ?? 1) : ""
  );
  const activeCategory = getCategoryMeta(category);

  const rewardOptions = useMemo<RewardOption[]>(() => {
    if (!bankCard) return [];

    if (card.type === "cashback") {
      const presets = bankCard.rewardStructure?.accelerated?.map((item) => ({
        label: `${item.category} - ${item.rate}%`,
        value: String(item.rate),
        mode: "percent" as const,
        unit: "cashback"
      })) ?? [];
      presets.unshift({
        label: `Base - ${bankCard.rewardStructure?.baseRate ?? 1}%`,
        value: String(bankCard.rewardStructure?.baseRate ?? 1),
        mode: "percent" as const,
        unit: "cashback"
      });
      return presets as RewardOption[];
    }

    if (card.type === "rewards") {
      const presetRates = new Set<number>([
        1,
        2,
        bankCard.rewardStructure?.baseRate ?? 1,
        ...(bankCard.rewardStructure?.accelerated?.map((item) => item.rate) ?? [])
      ]);

      return Array.from(presetRates)
        .filter((rate) => rate > 0)
        .sort((a, b) => a - b)
        .map((rate) => ({
        label: `${rate} point${rate > 1 ? "s" : ""} / ₹100`,
        value: String(rate),
        mode: "perCurrency" as const,
        unit: "points"
      }));
    }

    return [1, 2, 3, 5].map((rate) => ({
      label: `${rate}x miles`,
      value: String(rate),
      mode: "perCurrency" as const,
      unit: "miles"
    }));
  }, [bankCard, card.type]);

  const handleSave = () => {
    if (!merchant || !amount) return;
    const parsedAmount = Number(amount);
    const rate = rewardRate ? Number(rewardRate) : 0;
    const earned = isRewardEligible ? calculateRewardEarned(parsedAmount, rate, rewardRateMode) : 0;
    const parsedPointValue = rewardPointValue ? Number(rewardPointValue) : 0;

    const tx: Transaction = {
      id: Math.random().toString(36).slice(2),
      cardId: card.id,
      merchant,
      amount: parsedAmount,
      date: `${date}T${time}:00.000Z`,
      category,
      isRewardEligible,
      rewardType: card.type,
      rewardRate: isRewardEligible ? rate : undefined,
      rewardRateMode: isRewardEligible ? rewardRateMode : undefined,
      rewardUnit: isRewardEligible ? rewardUnit : undefined,
      rewardEarned: isRewardEligible ? earned : 0,
      rewardPointValue: isRewardEligible && rewardUnit === "points" ? parsedPointValue : undefined,
      status: "unbilled",
      createdAt: new Date().toISOString()
    };

    onAdd(tx);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="glass-panel-strong w-full max-w-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Add Spend</h2>
          <button onClick={onClose} className="text-sm font-semibold text-neutral-500 hover:text-neutral-800">
            Close
          </button>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Merchant</label>
            <input
              value={merchant}
              onChange={(event) => setMerchant(event.target.value)}
              placeholder="Swiggy, Amazon, IndiGo"
              className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Amount</label>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                type="number"
                min="0"
                className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Category</label>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                    activeCategory.className
                  }`}
                >
                  {activeCategory.short}
                </span>
                <span>{activeCategory.label}</span>
              </div>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
              >
                {spendCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Date</label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Time</label>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{getRewardTabLabel(card.type)}</h3>
                <p className="text-sm text-neutral-500">Adjust eligibility and earned value for this spend.</p>
              </div>
              <button
                onClick={() => setRewardEligible((prev) => !prev)}
                aria-pressed={isRewardEligible}
                className={`relative h-10 w-20 rounded-full border transition ${
                  isRewardEligible ? "border-emerald-400 bg-emerald-500" : "border-neutral-200 bg-neutral-200"
                }`}
              >
                <span
                  className={`absolute top-1.5 h-7 w-7 rounded-full bg-white shadow-md transition ${
                    isRewardEligible ? "left-11" : "left-1.5"
                  }`}
                />
              </button>
            </div>

            {isRewardEligible ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Rate</label>
                  <select
                    value={rewardRate}
                    onChange={(event) => {
                      const selected = rewardOptions.find((option) => option.value === event.target.value);
                      if (selected) {
                        setRewardRateMode(selected.mode);
                        setRewardUnit(selected.unit);
                      }
                      setRewardRate(event.target.value);
                    }}
                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-neutral-400"
                  >
                    <option value="">Select rate</option>
                    {rewardOptions.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Mode</label>
                  <select
                    value={rewardRateMode}
                    onChange={(event) => setRewardRateMode(event.target.value as typeof rewardRateMode)}
                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-neutral-400"
                  >
                    <option value="percent">Percent</option>
                    <option value="multiplier">Multiplier</option>
                    <option value="perCurrency">Per INR 100</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Unit</label>
                  <select
                    value={rewardUnit}
                    onChange={(event) => setRewardUnit(event.target.value)}
                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-neutral-400"
                  >
                    <option value="cashback">Cashback</option>
                    <option value="points">Reward Points</option>
                    <option value="miles">Miles</option>
                  </select>
                </div>
              </div>
            ) : null}

            {isRewardEligible && rewardUnit === "points" && (
              <div className="mt-3 grid gap-2 md:max-w-xs">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Point value (₹ per point)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rewardPointValue}
                  onChange={(event) => setRewardPointValue(event.target.value)}
                  placeholder="0.25"
                  className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-neutral-400"
                />
                <p className="text-xs text-neutral-500">Example: 1 reward point = ₹0.25</p>
              </div>
            )}

            {!isRewardEligible && (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                Rewards disabled for this transaction.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-full px-5 py-2 text-sm font-semibold text-neutral-500">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold"
          >
            Save Spend
          </button>
        </div>
      </div>
    </div>
  );
}
