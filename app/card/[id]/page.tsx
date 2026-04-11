"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import creditCardsData from "../../../data/creditCards";
import { useCards } from "../../../hooks/useCards";
import { useTransactions } from "../../../hooks/useTransactions";
import { categorizeTransactions, calculateDueDate } from "../../../lib/billingCycle";
import { CardIllustration } from "../../../components/cards/CardIllustration";
import AddSpendModal from "../../../components/cards/AddSpendModal";
import { RewardHistory } from "../../../components/detail/RewardHistory";
import { CardBenefits } from "../../../components/detail/CardBenefits";
import { RewardsCap } from "../../../components/detail/RewardsCap";
import { TransactionList } from "../../../components/detail/TransactionList";
import { BankCardData, CardNetwork, CardType, RewardRateMode, RewardUnit, Transaction, UserCard } from "../../../types";
import { getSharedLimitSummary } from "../../../lib/limitSharing";
import { spendCategories } from "../../../lib/categoryMeta";
import { getRewardTabLabel } from "../../../lib/rewardDisplay";
import { type RewardSortOption, type SpendSortOption } from "../../../lib/transactionSorting";

const networkVariants: Record<CardNetwork, string[]> = {
  Visa: ["Classic", "Gold", "Platinum", "Signature", "Infinite"],
  Mastercard: ["Standard", "Gold", "Platinum", "World", "World Elite"],
  RuPay: ["Classic", "Platinum", "Select", "EKAA"],
  Amex: ["Green", "Gold", "Platinum", "Centurion"],
  "Diners Club": ["Classic", "Privilege", "Black", "Premium"]
};

export default function CardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params?.id as string;
  const { cards, loading: cardsLoading, updateCard, deleteCard } = useCards();
  const {
    transactions,
    loading: transactionsLoading,
    addTransaction,
    deleteTransactions,
    updateTransaction,
    deleteTransaction
  } = useTransactions();
  const [activeTab, setActiveTab] = useState<"unbilled" | "billed" | "rewards">("unbilled");
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showPaid, setShowPaid] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [unbilledSort, setUnbilledSort] = useState<SpendSortOption>("newest");
  const [billedSort, setBilledSort] = useState<SpendSortOption>("newest");
  const [rewardSort, setRewardSort] = useState<RewardSortOption>("newest");
  const [editMerchant, setEditMerchant] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState(new Date().toISOString().slice(0, 10));
  const [editTime, setEditTime] = useState(new Date().toTimeString().slice(0, 5));
  const [editCategory, setEditCategory] = useState(spendCategories[0]);
  const [editRewardEligible, setEditRewardEligible] = useState(true);
  const [editRewardRate, setEditRewardRate] = useState("");
  const [editRewardRateMode, setEditRewardRateMode] = useState<RewardRateMode>("percent");
  const [editRewardUnit, setEditRewardUnit] = useState<RewardUnit>("points");
  const [editRewardPointValue, setEditRewardPointValue] = useState("");

  const card = cards.find((item) => item.id === cardId);
  const cardData = useMemo(
    () => (creditCardsData as BankCardData[]).find((item) => item.id === card?.bank_card_id),
    [card?.bank_card_id]
  );

  const cardTransactions = transactions.filter((tx) => (tx.cardId ?? tx.card_id) === cardId);
  const { unbilled, billed } = card
    ? categorizeTransactions(cardTransactions, card)
    : { unbilled: [], billed: [] };

  const unbilledTotal = unbilled.reduce((acc, tx) => acc + tx.amount, 0);
  const billedTotal = billed.reduce((acc, tx) => acc + tx.amount, 0);
  const totalRewardsReceived = cardTransactions.reduce((acc, tx) => acc + (tx.rewardEarned ?? tx.reward_earned ?? 0), 0);
  const totalCardSpend = cardTransactions.reduce((acc, tx) => acc + tx.amount, 0);
  const configuredAnnualFee = card?.annual_fee ?? cardData?.annualFee ?? 0;
  const isCardLtf = card?.is_ltf ?? configuredAnnualFee === 0;
  const feeWaiverTarget = card?.annual_fee_waiver_target ?? (configuredAnnualFee > 0 ? configuredAnnualFee * 100 : 0);
  const includePastCumulativeSpend = card?.include_past_cumulative_spend ?? false;
  const pastCumulativeSpend = card?.past_cumulative_spend ?? 0;
  const effectiveWaiverSpend = totalCardSpend + (includePastCumulativeSpend ? pastCumulativeSpend : 0);
  const restoredAnnualFee = configuredAnnualFee > 0 ? configuredAnnualFee : cardData?.annualFee ?? 0;
  const restoredWaiverTarget = feeWaiverTarget > 0 ? feeWaiverTarget : restoredAnnualFee > 0 ? restoredAnnualFee * 100 : 0;
  const feeWaiverRemaining = Math.max(feeWaiverTarget - effectiveWaiverSpend, 0);
  const showFeeWaiverTracker = !isCardLtf && configuredAnnualFee > 0 && feeWaiverTarget > 0;
  const sharedLimitSummary = card ? getSharedLimitSummary(cards, transactions, card) : null;
  const statementDay = Number(card?.statement_date ?? card?.statementDate ?? 1);
  const graceDays = Number(card?.grace_period_days ?? card?.gracePeriodDays ?? 0);
  const currentCardType: CardType = (card?.card_type ?? card?.type ?? "cashback") as CardType;
  const currentSubNetwork = card?.sub_network ?? card?.subNetwork ?? "";
  const dueDate = card ? calculateDueDate(statementDay, graceDays) : null;
  const cardCreditLimit = Number((card as { credit_limit?: number; creditLimit?: number } | undefined)?.credit_limit
    ?? (card as { credit_limit?: number; creditLimit?: number } | undefined)?.creditLimit
    ?? 0);
  const rewardRateOptions = useMemo(() => {
    if (!cardData || !card) return [] as Array<{ label: string; value: string; mode: RewardRateMode; unit: string }>;

    if (currentCardType === "cashback") {
      const presets =
        cardData.rewardStructure?.accelerated?.map((item: any) => ({
          label: `${item.category} - ${item.rate}%`,
          value: String(item.rate),
          mode: "percent" as RewardRateMode,
          unit: "cashback"
        })) ?? [];

      presets.unshift({
        label: `Base - ${cardData.rewardStructure?.baseRate ?? 1}%`,
        value: String(cardData.rewardStructure?.baseRate ?? 1),
        mode: "percent" as RewardRateMode,
        unit: "cashback"
      });
      return presets;
    }

    if (currentCardType === "rewards") {
      const presetRates = new Set<number>([
        1,
        2,
        cardData.rewardStructure?.baseRate ?? 1,
        ...(cardData.rewardStructure?.accelerated?.map((item: any) => item.rate) ?? [])
      ]);

      return Array.from(presetRates)
        .filter((rate) => rate > 0)
        .sort((a, b) => a - b)
        .map((rate) => ({
          label: `${rate} point${rate > 1 ? "s" : ""} / ₹100`,
          value: String(rate),
          mode: "perCurrency" as RewardRateMode,
          unit: "points"
        }));
    }

    return [1, 2, 3, 5].map((rate) => ({
      label: `${rate}x miles`,
      value: String(rate),
      mode: "perCurrency" as RewardRateMode,
      unit: "miles"
    }));
  }, [card, cardData, currentCardType]);

  if ((cardsLoading || transactionsLoading) && cards.length === 0) {
    return (
      <section className="glass-panel p-10 text-neutral-500 text-center">
        Syncing card data...
      </section>
    );
  }

  if (!card) {
    return (
      <section className="glass-panel p-10 text-center">
        <h1 className="text-2xl font-semibold">Card not found</h1>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold"
        >
          Back to Dashboard
        </button>
      </section>
    );
  }

  const networkOptions = Array.from(
    new Set<CardNetwork>([
      ...((cardData?.networks as CardNetwork[] | undefined) ?? []),
      ...(Object.keys(networkVariants) as CardNetwork[]),
      card.network
    ])
  );

  const subNetworkOptions = Array.from(
    new Set<string>([
      ...((cardData?.subNetworks?.[card.network] as string[] | undefined) ?? []),
      ...(networkVariants[card.network] ?? []),
      currentSubNetwork
    ])
  );

  const handleClearDues = () => {
    if (billed.length === 0 || isClearing) return;
    setIsClearing(true);
    const ids = billed.map((tx) => tx.id);
    setTimeout(() => {
      deleteTransactions(ids);
      setIsClearing(false);
      setShowPaid(true);
      setTimeout(() => setShowPaid(false), 1200);
    }, 350);
  };

  const handleUpdateSettings = (updates: Partial<UserCard>) => {
    if (card) {
      updateCard({ ...card, ...updates });
    }
  };

  const calculateRewardEarned = (amount: number, rate: number, rateMode: RewardRateMode) => {
    if (!rate || !amount) return 0;
    if (rateMode === "percent") return (amount * rate) / 100;
    if (rateMode === "multiplier") return amount * rate;
    return (amount / 100) * rate;
  };

  const openEditTransaction = (tx: Transaction) => {
    const txDate = new Date(tx.date);
    setEditingTransaction(tx);
    setEditMerchant(tx.merchant);
    setEditAmount(String(tx.amount));
    setEditDate(txDate.toISOString().slice(0, 10));
    setEditTime(txDate.toTimeString().slice(0, 5));
    setEditCategory(tx.category);
    setEditRewardEligible(tx.is_reward_eligible ?? tx.isRewardEligible ?? true);
    setEditRewardRate(tx.reward_rate !== undefined ? String(tx.reward_rate) : tx.rewardRate !== undefined ? String(tx.rewardRate) : "");
    setEditRewardRateMode(tx.reward_rate_mode ?? tx.rewardRateMode ?? (currentCardType === "cashback" ? "percent" : "perCurrency"));
    setEditRewardUnit(
      (tx.reward_unit ?? tx.rewardUnit ?? (currentCardType === "cashback" ? "cashback" : currentCardType === "miles" ? "miles" : "points")) as RewardUnit
    );
    setEditRewardPointValue(
      tx.reward_point_value !== undefined
        ? String(tx.reward_point_value)
        : tx.rewardPointValue !== undefined
        ? String(tx.rewardPointValue)
        : String(cardData?.rewardStructure?.pointValue ?? 1)
    );
  };

  const handleSaveTransactionEdit = () => {
    if (!editingTransaction || !editMerchant || !editAmount || !card) return;

    const parsedAmount = Number(editAmount);
    const parsedRate = editRewardRate ? Number(editRewardRate) : 0;
    const parsedPointValue = editRewardPointValue ? Number(editRewardPointValue) : 0;
    const rewardEarned = editRewardEligible
      ? calculateRewardEarned(parsedAmount, parsedRate, editRewardRateMode)
      : 0;

    updateTransaction({
      ...editingTransaction,
      merchant: editMerchant,
      amount: parsedAmount,
      date: `${editDate}T${editTime}:00.000Z`,
      category: editCategory,
      is_reward_eligible: editRewardEligible,
      reward_type: currentCardType,
      reward_rate: editRewardEligible ? parsedRate : undefined,
      reward_rate_mode: editRewardEligible ? editRewardRateMode : undefined,
      reward_unit: editRewardEligible ? editRewardUnit : undefined,
      reward_earned: editRewardEligible ? rewardEarned : 0,
      reward_point_value: editRewardEligible && editRewardUnit === "points" ? parsedPointValue : undefined
    });

    setEditingTransaction(null);
  };

  const handleDeleteTransaction = () => {
    if (!editingTransaction) return;
    deleteTransaction(editingTransaction.id);
    setEditingTransaction(null);
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <div className="space-y-5">
        <CardIllustration
          card={card}
          cardType={currentCardType}
          annualFee={configuredAnnualFee}
          isLtf={isCardLtf}
          unbilledTotal={unbilledTotal}
          billedTotal={billedTotal}
          totalRewardsReceived={totalRewardsReceived}
          showDetailedStats
          sharedLimitSummary={sharedLimitSummary ?? undefined}
          onAddSpend={() => setShowSpendModal(true)}
          onClearDues={billed.length > 0 ? handleClearDues : undefined}
          isClearing={isClearing}
          showPaid={showPaid}
        />
        <div className="glass-panel p-5 text-sm text-neutral-600 space-y-2">
          <div className="flex items-center justify-between">
            <span>Credit Limit</span>
            <span className="font-semibold text-neutral-900">₹{cardCreditLimit.toLocaleString("en-IN")}</span>
          </div>
          {sharedLimitSummary?.sharedLimitEnabled && (
            <div className="rounded-2xl border border-white/60 bg-white/70 px-3 py-2 text-xs text-neutral-600">
              Shared with {sharedLimitSummary.memberCards.length} cards in this limit pool
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Statement Day</span>
            <span className="font-semibold text-neutral-900">{card.statement_date}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Due Date</span>
            <span className="font-semibold text-neutral-900">
              {dueDate ? dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Unbilled Spend</span>
            <span className="font-semibold text-neutral-900">₹{unbilledTotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Statement Spend</span>
            <span className="font-semibold text-neutral-900">₹{billedTotal.toLocaleString("en-IN")}</span>
          </div>
          {showFeeWaiverTracker && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {feeWaiverRemaining > 0 ? (
                <>
                  Spend more <span className="font-semibold">₹{feeWaiverRemaining.toLocaleString("en-IN")}</span> to waive annual fee.
                </>
              ) : (
                <span className="font-semibold">Annual fee waiver target achieved.</span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowSettings((prev) => !prev)}
          className="rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-semibold"
        >
          {showSettings ? "Close Settings" : "Card Settings"}
        </button>

        {showSettings && (
          <div className="glass-panel p-5 space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Network</label>
              <select
                value={card.network}
                onChange={(event) => {
                  const nextNetwork = event.target.value as CardNetwork;
                  const nextSubNetworkOptions = Array.from(
                    new Set<string>([
                      ...((cardData?.subNetworks?.[nextNetwork] as string[] | undefined) ?? []),
                      ...(networkVariants[nextNetwork] ?? []),
                      currentSubNetwork
                    ])
                  );
                  const nextSubNetwork = nextSubNetworkOptions.includes(currentSubNetwork)
                    ? currentSubNetwork
                    : nextSubNetworkOptions[0] ?? currentSubNetwork;

                  handleUpdateSettings({ network: nextNetwork, sub_network: nextSubNetwork });
                }}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                {networkOptions.map((network) => (
                  <option key={network} value={network}>
                    {network}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Sub-network</label>
              <select
                value={card.sub_network}
                onChange={(event) => handleUpdateSettings({ sub_network: event.target.value })}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                {subNetworkOptions.map((variant: string) => (
                  <option key={variant} value={variant}>
                    {variant}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Card Last 4 Digits</label>
              <input
                type="text"
                value={card.last_4_digits}
                maxLength={4}
                inputMode="numeric"
                onChange={(event) =>
                  handleUpdateSettings({
                    last_4_digits: event.target.value.replace(/\D/g, "").slice(0, 4)
                  })
                }
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Statement Day</label>
              <input
                type="number"
                value={card.statement_date}
                min={1}
                max={31}
                onChange={(event) => handleUpdateSettings({ statement_date: Number(event.target.value) })}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Grace Period (days)</label>
              <input
                type="number"
                value={card.grace_period_days}
                min={0}
                max={45}
                onChange={(event) => handleUpdateSettings({ grace_period_days: Number(event.target.value) })}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Credit Limit</label>
              <input
                type="number"
                value={card.credit_limit}
                min={0}
                onChange={(event) => handleUpdateSettings({ credit_limit: Number(event.target.value) })}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Life Time Free (LTF)</h3>
                  <p className="text-xs text-neutral-500">When enabled, annual fee is treated as zero.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateSettings({
                      is_ltf: !isCardLtf,
                      annual_fee: isCardLtf ? restoredAnnualFee : configuredAnnualFee,
                      annual_fee_waiver_target: isCardLtf ? restoredWaiverTarget : 0,
                      include_past_cumulative_spend: isCardLtf ? includePastCumulativeSpend : false,
                      past_cumulative_spend: isCardLtf ? pastCumulativeSpend : 0
                    })
                  }
                  className={`relative h-7 w-14 rounded-full transition ${
                    isCardLtf ? "bg-emerald-500" : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      isCardLtf ? "left-8" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold">Annual Fee (before GST)</label>
                <input
                  type="number"
                  value={isCardLtf ? 0 : configuredAnnualFee}
                  min={0}
                  disabled={isCardLtf}
                  onChange={(event) =>
                    handleUpdateSettings({
                      annual_fee: Math.max(Number(event.target.value) || 0, 0),
                      is_ltf: false
                    })
                  }
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm disabled:bg-neutral-100 disabled:text-neutral-500"
                />
                <p className="text-xs text-neutral-500">
                  Effective annual fee = ₹{((isCardLtf ? 0 : configuredAnnualFee) * 1.18).toLocaleString("en-IN")} (includes 18% GST)
                </p>
              </div>

              {!isCardLtf && (
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Annual Fee Waiver Target Spend</label>
                  <input
                    type="number"
                    value={feeWaiverTarget}
                    min={0}
                    onChange={(event) =>
                      handleUpdateSettings({
                        annual_fee_waiver_target: Math.max(Number(event.target.value) || 0, 0)
                      })
                    }
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                  />
                  <div className="rounded-xl border border-white/60 bg-white/70 p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold">Include Past Cumulative Spend</h4>
                        <p className="text-xs text-neutral-500">Adds historical spends to reduce remaining waiver target.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateSettings({
                            include_past_cumulative_spend: !includePastCumulativeSpend,
                            past_cumulative_spend: !includePastCumulativeSpend ? pastCumulativeSpend : 0
                          })
                        }
                        className={`relative h-7 w-14 rounded-full transition ${
                          includePastCumulativeSpend ? "bg-emerald-500" : "bg-neutral-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                            includePastCumulativeSpend ? "left-8" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                    {includePastCumulativeSpend && (
                      <div className="grid gap-2">
                        <label className="text-xs font-semibold text-neutral-600">Past Cumulative Spend</label>
                        <input
                          type="number"
                          min={0}
                          value={pastCumulativeSpend}
                          onChange={(event) =>
                            handleUpdateSettings({
                              past_cumulative_spend: Math.max(Number(event.target.value) || 0, 0)
                            })
                          }
                          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">
                    Spent so far: ₹{totalCardSpend.toLocaleString("en-IN")}
                    {includePastCumulativeSpend && ` + ₹${pastCumulativeSpend.toLocaleString("en-IN")} (past)`}. Remaining: ₹
                    {feeWaiverRemaining.toLocaleString("en-IN")}.
                  </p>
                </div>
              )}

              <div className="grid gap-2">
                <label className="text-sm font-semibold">Card Opening / Renewal Month</label>
                <input
                  type="month"
                  value={card.renewalMonth ?? card.createdAt.slice(0, 7)}
                  onChange={(event) =>
                    handleUpdateSettings({
                      renewalMonth: event.target.value
                    })
                  }
                  className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Reward Type</label>
              <select
                value={card.type}
                onChange={(event) => handleUpdateSettings({ type: event.target.value as CardType })}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                <option value="cashback">Cashback</option>
                <option value="rewards">Rewards</option>
                <option value="miles">Miles</option>
              </select>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this card? This action cannot be undone.")) {
                  deleteCard(card.id);
                  router.push("/");
                }
              }}
              className="w-full rounded-full bg-red-500 text-white px-5 py-2 text-sm font-semibold"
            >
              Delete Card
            </button>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <button
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              activeTab === "unbilled" ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200"
            }`}
            onClick={() => setActiveTab("unbilled")}
          >
            Unbilled
          </button>
          <button
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              activeTab === "billed" ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200"
            }`}
            onClick={() => setActiveTab("billed")}
          >
            Statement
          </button>
          <button
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              activeTab === "rewards" ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200"
            }`}
            onClick={() => setActiveTab("rewards")}
          >
            {getRewardTabLabel(currentCardType)}
          </button>
          {activeTab === "billed" && billed.length > 0 && (
            <button
              onClick={handleClearDues}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700"
            >
              {isClearing ? "Clearing..." : "Clear Dues"}
            </button>
          )}
        </div>

        {activeTab === "unbilled" && (
          <div className="space-y-5">
            <TransactionList
              title="Unbilled Spends"
              transactions={unbilled}
              sortBy={unbilledSort}
              onSortChange={setUnbilledSort}
              onTransactionClick={openEditTransaction}
              activeTransactionId={editingTransaction?.id}
            />
            <CardBenefits card={card} cardData={cardData} />
          </div>
        )}
        {activeTab === "billed" && (
          <TransactionList
            title="Statement Spends"
            transactions={billed}
            sortBy={billedSort}
            onSortChange={setBilledSort}
            isFading={isClearing}
            onTransactionClick={openEditTransaction}
            activeTransactionId={editingTransaction?.id}
          />
        )}
        {activeTab === "rewards" && (
          <>
            <RewardHistory
              transactions={cardTransactions}
              cardType={currentCardType}
              sortBy={rewardSort}
              onSortChange={setRewardSort}
            />
            <RewardsCap cardData={cardData} />
          </>
        )}
      </div>

      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="glass-panel-strong w-full max-w-2xl p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Edit Transaction</h2>
              <button
                onClick={() => setEditingTransaction(null)}
                className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Merchant</label>
                <input
                  value={editMerchant}
                  onChange={(event) => setEditMerchant(event.target.value)}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Amount</label>
                  <input
                    type="number"
                    min={0}
                    value={editAmount}
                    onChange={(event) => setEditAmount(event.target.value)}
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Category</label>
                  <select
                    value={editCategory}
                    onChange={(event) => setEditCategory(event.target.value)}
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(event) => setEditDate(event.target.value)}
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Time</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(event) => setEditTime(event.target.value)}
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{getRewardTabLabel(currentCardType)}</h3>
                  <p className="text-sm text-neutral-500">Adjust eligibility and earned value for this spend.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditRewardEligible((prev) => !prev)}
                  className={`relative h-7 w-14 rounded-full transition ${
                    editRewardEligible ? "bg-emerald-500" : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      editRewardEligible ? "left-8" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {editRewardEligible && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <select
                    value={editRewardRate}
                    onChange={(event) => {
                      const selected = rewardRateOptions.find((option) => option.value === event.target.value);
                      if (selected) {
                        setEditRewardRateMode(selected.mode);
                        setEditRewardUnit(selected.unit as RewardUnit);
                      }
                      setEditRewardRate(event.target.value);
                    }}
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm"
                  >
                    <option value="">Select rate</option>
                    {rewardRateOptions.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editRewardRateMode}
                    onChange={(event) => setEditRewardRateMode(event.target.value as RewardRateMode)}
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm"
                  >
                    <option value="percent">Percent</option>
                    <option value="perCurrency">Per INR 100</option>
                    <option value="multiplier">Multiplier</option>
                  </select>
                  <select
                    value={editRewardUnit}
                    onChange={(event) => setEditRewardUnit(event.target.value as RewardUnit)}
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm"
                  >
                    <option value="cashback">Cashback</option>
                    <option value="points">Reward Points</option>
                    <option value="miles">Miles</option>
                  </select>
                </div>
              )}

              {editRewardEligible && editRewardUnit === "points" && (
                <div className="mt-3 grid gap-2 md:max-w-xs">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Point value (₹ per point)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editRewardPointValue}
                    onChange={(event) => setEditRewardPointValue(event.target.value)}
                    className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm"
                  />
                  <p className="text-xs text-neutral-500">Example: 1 reward point = ₹0.25</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleDeleteTransaction}
                className="rounded-full bg-red-500 text-white px-5 py-2 text-sm font-semibold"
              >
                Delete
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="rounded-full px-5 py-2 text-sm font-semibold text-neutral-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTransactionEdit}
                  className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSpendModal && (
        <AddSpendModal
          card={card}
          onClose={() => setShowSpendModal(false)}
          onAdd={(tx) => {
            addTransaction(tx);
            setShowSpendModal(false);
          }}
        />
      )}
    </section>
  );
}
