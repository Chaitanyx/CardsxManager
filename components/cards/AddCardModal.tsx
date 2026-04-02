"use client";
import React, { useMemo, useState } from "react";
import { addMonths, differenceInCalendarDays, setDate } from "date-fns";
import { UserCard, BankCardData, CardNetwork, CardType } from "../../types";
import creditCardsData from "../../data/creditCards";
import { calculateDueDate } from "../../lib/billingCycle";
import { SiAmericanexpress, SiAxisbank, SiDinersclub, SiHdfcbank, SiHsbc, SiIcicibank } from "react-icons/si";

type BankVisual = {
  short: string;
  gradient: [string, string];
  icon?: React.ElementType;
};

const bankVisuals: Record<string, BankVisual> = {
  "HDFC Bank": { short: "HDFC", gradient: ["#004B8D", "#E31837"], icon: SiHdfcbank },
  "SBI Card": { short: "SBI", gradient: ["#1D4ED8", "#2563EB"] },
  "ICICI Bank": { short: "ICICI", gradient: ["#1F4E79", "#0B2D4D"], icon: SiIcicibank },
  "Axis Bank": { short: "AXIS", gradient: ["#0F172A", "#0EA5E9"], icon: SiAxisbank },
  "American Express": { short: "AMEX", gradient: ["#0057A2", "#00A0DF"], icon: SiAmericanexpress },
  "HSBC Bank": { short: "HSBC", gradient: ["#DB0011", "#8A000B"], icon: SiHsbc },
  "Diners Club": { short: "DINERS", gradient: ["#0B1020", "#4B5563"], icon: SiDinersclub },
  "Kotak Mahindra Bank": { short: "KOTAK", gradient: ["#DC2626", "#1D4ED8"] },
  "IDFC FIRST Bank": { short: "IDFC", gradient: ["#B91C1C", "#7F1D1D"] },
  "RBL Bank": { short: "RBL", gradient: ["#BE123C", "#881337"] },
  "IndusInd Bank": { short: "INDUS", gradient: ["#7C2D12", "#EA580C"] },
  "Yes Bank": { short: "YES", gradient: ["#1D4ED8", "#0EA5E9"] },
  "Standard Chartered": { short: "SC", gradient: ["#0F766E", "#16A34A"] },
  "Federal Bank": { short: "FED", gradient: ["#0F766E", "#06B6D4"] },
  "AU Small Finance Bank": { short: "AU", gradient: ["#B45309", "#F59E0B"] },
  "Canara Bank": { short: "CAN", gradient: ["#C2410C", "#F97316"] },
  "Bank of Baroda": { short: "BOB", gradient: ["#EA580C", "#FB923C"] }
};

function getBankVisual(bank: string): BankVisual {
  const mapped = bankVisuals[bank];
  if (mapped) return mapped;

  const initials = bank
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();

  return {
    short: initials || "BANK",
    gradient: ["#374151", "#111827"]
  };
}

const networkVariants: Record<CardNetwork, string[]> = {
  Visa: ["Classic", "Gold", "Platinum", "Signature", "Infinite"],
  Mastercard: ["Standard", "Gold", "Platinum", "World", "World Elite"],
  RuPay: ["Classic", "Platinum", "Select", "EKAA"],
  Amex: ["Green", "Gold", "Platinum", "Centurion"],
  "Diners Club": ["Classic", "Privilege", "Black", "Premium" ]
};

const allNetworkOptions = Object.keys(networkVariants) as CardNetwork[];

export default function AddCardModal({
  cards,
  onClose,
  onAdd,
  onUpdateCard
}: {
  cards: UserCard[];
  onClose: () => void;
  onAdd: (card: UserCard) => void;
  onUpdateCard: (id: string, updates: Partial<UserCard>) => void;
}) {
  const bankCards = creditCardsData as unknown as BankCardData[];
  const [step, setStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<BankCardData | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<CardNetwork | null>(null);
  const [selectedSubNetwork, setSelectedSubNetwork] = useState<string>("");
  const [statementDate, setStatementDate] = useState<number>(20);
  const [dueDate, setDueDate] = useState<number>(10);
  const [creditLimit, setCreditLimit] = useState<number>(50000);
  const [last4, setLast4] = useState<string>("");
  const [rewardType, setRewardType] = useState<CardType>("cashback");
  const [shareLimit, setShareLimit] = useState(false);
  const [sharedWithCardIds, setSharedWithCardIds] = useState<string[]>([]);

  const banks = useMemo(() => {
    const items = bankCards.map((card) => card.bank);
    return Array.from(new Set(items)).sort();
  }, [bankCards]);

  const cardsForBank = useMemo(() => {
    if (!selectedBank) return [];
    return bankCards.filter((card) => card.bank === selectedBank);
  }, [selectedBank, bankCards]);

  const existingCardsForBank = useMemo(() => {
    if (!selectedBank) return [];
    return cards.filter((card) => card.bank === selectedBank);
  }, [cards, selectedBank]);

  const availableSubNetworks = useMemo(() => {
    if (!selectedCard || !selectedNetwork) return [];
    const preferred =
      selectedCard.preferredNetwork === selectedNetwork && selectedCard.preferredSubNetwork
        ? [selectedCard.preferredSubNetwork]
        : [];
    const cardDefined = selectedCard.subNetworks?.[selectedNetwork] ?? [];
    const generic = networkVariants[selectedNetwork] ?? [];
    return Array.from(new Set([...preferred, ...cardDefined, ...generic]));
  }, [selectedCard, selectedNetwork]);

  const formatMoney = (value: number) => `₹${value.toLocaleString("en-IN")}`;

  const rewardSummary = selectedCard
    ? selectedCard.rewardStructure.accelerated?.slice(0, 4).map((item) => ({
        label: item.category,
        value: item.unit.includes("%") ? `${item.rate}%` : `${item.rate}x`,
        unit: item.unit
      })) ?? []
    : [];

  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
    setSelectedCard(null);
    setStep(2);
  };

  const handleCardSelect = (card: BankCardData) => {
    setSelectedCard(card);
    setSelectedNetwork(card.preferredNetwork);
    setSelectedSubNetwork(card.preferredSubNetwork);
    setStatementDate(card.statementDate);
    setRewardType(card.type);
    setShareLimit(false);
    setSharedWithCardIds([]);
    const nextDue = calculateDueDate(card.statementDate, card.gracePeriodDays);
    setDueDate(nextDue.getDate());
    setStep(3);
  };

  const handleNetworkSelect = (network: CardNetwork) => {
    setSelectedNetwork(network);
    const preferred =
      selectedCard?.preferredNetwork === network && selectedCard.preferredSubNetwork
        ? [selectedCard.preferredSubNetwork]
        : [];
    const fromCard = selectedCard?.subNetworks?.[network] ?? [];
    const generic = networkVariants[network] ?? [];
    const nextSub = Array.from(new Set([...preferred, ...fromCard, ...generic]))[0] ?? "";
    setSelectedSubNetwork(nextSub);
  };

  const handleDueDateChange = (value: number) => {
    if (Number.isNaN(value)) return;
    setDueDate(value);
  };

  const handleStatementDateChange = (value: number) => {
    if (Number.isNaN(value)) return;
    setStatementDate(value);
  };

  const calculateGracePeriod = () => {
    const today = new Date();
    const statementAnchor = setDate(today, statementDate);
    const dueAnchor = setDate(addMonths(statementAnchor, dueDate < statementDate ? 1 : 0), dueDate);
    return Math.max(differenceInCalendarDays(dueAnchor, statementAnchor), 0);
  };

  const handleAdd = () => {
    if (!selectedCard || !selectedNetwork || !/^\d{4}$/.test(last4)) return;

    const gracePeriodDays = calculateGracePeriod();
    const cardsToShareWith = shareLimit
      ? existingCardsForBank.filter((item) => sharedWithCardIds.includes(item.id))
      : [];
    const sharedLimitGroupId =
      shareLimit && cardsToShareWith.length > 0
        ? cardsToShareWith.find((item) => item.sharedLimitGroupId)?.sharedLimitGroupId ??
          `shared-${Math.random().toString(36).slice(2, 10)}`
        : undefined;

    if (sharedLimitGroupId && cardsToShareWith.length > 0) {
      const groupMembers = existingCardsForBank.filter(
        (item) => item.sharedLimitGroupId === sharedLimitGroupId || cardsToShareWith.some((selected) => selected.id === item.id)
      );

      groupMembers.forEach((member) => {
        onUpdateCard(member.id, {
          sharedLimitGroupId,
          creditLimit
        });
      });
    }

    const newCard: UserCard = {
      id: Math.random().toString(36).substring(7),
      bankCardId: selectedCard.id,
      bank: selectedCard.bank,
      name: selectedCard.name,
      last4,
      type: rewardType,
      network: selectedNetwork,
      subNetwork: selectedSubNetwork,
      statementDate,
      gracePeriodDays,
      dueDate,
      creditLimit,
      annualFee: selectedCard.annualFee,
      isLtf: selectedCard.annualFee === 0,
      annualFeeWaiverTarget: selectedCard.annualFee > 0 ? selectedCard.annualFee * 100 : 0,
      includePastCumulativeSpend: false,
      pastCumulativeSpend: 0,
      renewalMonth: new Date().toISOString().slice(0, 7),
      sharedLimitGroupId,
      color: selectedCard.color as [string, string],
      createdAt: new Date().toISOString()
    };

    onAdd(newCard);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
      <div className="glass-panel-strong w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/60">
          <h2 className="text-2xl font-semibold">Add a New Card</h2>
          <p className="text-sm text-neutral-500">Step {step} of 6</p>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banks.map((bank) => (
                (() => {
                  const visual = getBankVisual(bank);
                  return (
                    <button
                      key={bank}
                      className="p-4 rounded-2xl border border-neutral-200 bg-white text-left hover:bg-neutral-50 transition"
                      onClick={() => handleBankSelect(bank)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-11 w-11 rounded-xl flex items-center justify-center text-[10px] font-bold tracking-wide text-white soft-ring"
                          style={{ background: `linear-gradient(135deg, ${visual.gradient[0]}, ${visual.gradient[1]})` }}
                        >
                          {visual.icon ? <visual.icon className="h-6 w-6" aria-hidden="true" /> : visual.short}
                        </div>
                        <div>
                          <span className="font-semibold block">{bank}</span>
                          <span className="block text-sm text-neutral-500">Select to view cards</span>
                        </div>
                      </div>
                    </button>
                  );
                })()
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {cardsForBank.map((card) => (
                <button
                  key={card.id}
                  className="group text-left transition hover:-translate-y-0.5"
                  onClick={() => handleCardSelect(card)}
                >
                  <div
                    className="relative overflow-hidden rounded-[1.6rem] border border-white/70 p-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)] min-h-[190px] flex flex-col justify-between"
                    style={{ background: `linear-gradient(135deg, ${card.color[0]}, ${card.color[1]})` }}
                  >
                    <div className="absolute inset-0 opacity-45" style={{ background: "radial-gradient(circle at 88% 18%, rgba(255,255,255,0.48), transparent 40%)" }} />
                    <div className="absolute inset-0 opacity-18" style={{ background: "radial-gradient(circle at 12% 96%, rgba(0,0,0,0.32), transparent 46%)" }} />
                    <div className="absolute inset-0 opacity-14" style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 12px)" }} />
                    <div className="absolute left-0 right-0 top-0 h-14 opacity-40" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0))" }} />

                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium opacity-90">{card.bank}</div>
                        <h3 className="mt-2 text-xl font-semibold leading-tight line-clamp-2">{card.name}</h3>
                      </div>
                      <div className="rounded-full bg-white/18 px-3 py-1 text-[10px] font-semibold tracking-[0.24em] uppercase backdrop-blur">
                        {(card.preferredNetwork ?? selectedCard?.preferredNetwork ?? "card").toUpperCase()}
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
                      <span className="rounded-full bg-white/16 px-3 py-1">{card.type}</span>
                      <span className="rounded-full bg-white/16 px-3 py-1">{formatMoney(card.annualFee)} annual fee</span>
                    </div>

                    <div className="relative z-10 flex items-end justify-between gap-4">
                      <div className="chip h-10 w-14 rounded-lg" />
                      <div className="rounded-full bg-white/16 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase backdrop-blur">
                        {(card.preferredSubNetwork || "network").toUpperCase()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 3 && selectedCard && (
            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
              <div className="grid gap-4 content-start">
                <div className="rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${selectedCard.color[0]}, ${selectedCard.color[1]})` }}>
                  <div className="relative overflow-hidden rounded-xl p-5 -m-2" style={{ background: `linear-gradient(135deg, ${selectedCard.color[0]}, ${selectedCard.color[1]})` }}>
                    <div className="absolute inset-0 opacity-45" style={{ background: "radial-gradient(circle at 88% 18%, rgba(255,255,255,0.48), transparent 44%)" }} />
                    <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 12% 96%, rgba(0,0,0,0.32), transparent 48%)" }} />
                    <div className="absolute left-0 right-0 top-0 h-14 opacity-50" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0))" }} />
                    <div className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-1 text-[10px] font-semibold tracking-[0.22em]">
                      {(selectedNetwork ?? selectedCard.preferredNetwork).toUpperCase()}
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-semibold leading-tight max-w-[86%]">{selectedCard.name}</h3>
                      <p className="text-sm opacity-85 mt-1">{selectedCard.bank}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase">
                        <span className="rounded-full bg-white/16 px-3 py-1">{selectedCard.type}</span>
                        <span className="rounded-full bg-white/16 px-3 py-1">{formatMoney(selectedCard.annualFee)} annual fee</span>
                        <span className="rounded-full bg-white/16 px-3 py-1">{selectedCard.rewardStructure.pointValue} point value</span>
                      </div>
                      <div className="mt-5 flex items-center justify-between">
                        <div className="chip h-10 w-14 rounded-lg" />
                        <div className="rounded-full bg-white/16 px-3 py-1 text-xs font-semibold tracking-[0.18em]">
                          {(selectedSubNetwork || selectedCard.preferredSubNetwork).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">Network</label>
                    <select
                      value={selectedNetwork ?? ""}
                      onChange={(event) => handleNetworkSelect(event.target.value as CardNetwork)}
                      className="rounded-xl border border-neutral-200 bg-white px-4 py-2"
                    >
                      {allNetworkOptions.map((network) => (
                        <option key={network} value={network}>
                          {network}
                          {network === selectedCard.preferredNetwork ? " (Preferred)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">Sub-network</label>
                    <select
                      value={selectedSubNetwork}
                      onChange={(event) => setSelectedSubNetwork(event.target.value)}
                      className="rounded-xl border border-neutral-200 bg-white px-4 py-2"
                    >
                      {availableSubNetworks.map((variant) => (
                        <option key={variant} value={variant}>
                          {variant}
                          {variant === selectedCard.preferredSubNetwork && selectedNetwork === selectedCard.preferredNetwork
                            ? " (Preferred)"
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass-panel-strong h-full p-5 grid content-start gap-4">
                <div>
                  <h4 className="text-lg font-semibold">Card Features</h4>
                  <p className="text-sm text-neutral-500">Quick view of the card’s fees, rewards, and fit.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white px-3 py-3 border border-neutral-200">
                    <div className="text-neutral-500 text-xs">Category</div>
                    <div className="font-semibold capitalize">{selectedCard.type}</div>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-3 border border-neutral-200">
                    <div className="text-neutral-500 text-xs">Annual Fee</div>
                    <div className="font-semibold">{formatMoney(selectedCard.annualFee)}</div>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-3 border border-neutral-200">
                    <div className="text-neutral-500 text-xs">Joining Fee</div>
                    <div className="font-semibold">{formatMoney(selectedCard.joiningFee)}</div>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-3 border border-neutral-200">
                    <div className="text-neutral-500 text-xs">Predicted Value</div>
                    <div className="font-semibold">{selectedCard.rewardStructure.pointValue} per point</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">Reward structure</div>
                  <div className="grid gap-2">
                    <div className="rounded-2xl bg-white px-3 py-3 border border-neutral-200">
                      <div className="text-xs text-neutral-500">Base rate</div>
                      <div className="font-semibold">
                        {selectedCard.rewardStructure.baseRate}
                        {selectedCard.type === "cashback" ? "% cashback" : selectedCard.type === "miles" ? " miles style earn" : " points per spend"}
                      </div>
                    </div>
                    {rewardSummary.length > 0 && (
                      <div className="grid gap-2">
                        {rewardSummary.map((item) => (
                          <div key={item.label} className="rounded-2xl bg-white px-3 py-3 border border-neutral-200 flex items-center justify-between gap-3 text-sm">
                            <div>
                              <div className="font-semibold">{item.label}</div>
                              <div className="text-xs text-neutral-500">{item.unit}</div>
                            </div>
                            <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedCard.features?.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">Key features</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCard.features.slice(0, 8).map((feature) => (
                        <span key={feature} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Statement Date (day of month)</label>
                <input
                  type="number"
                  value={statementDate}
                  min={1}
                  max={31}
                  onChange={(event) => handleStatementDateChange(Number(event.target.value))}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Due Date (day of month)</label>
                <input
                  type="number"
                  value={dueDate}
                  min={1}
                  max={31}
                  onChange={(event) => handleDueDateChange(Number(event.target.value))}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-4">
              {existingCardsForBank.length > 0 && (
                <div className="glass-panel p-4 grid gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">Shared limit with existing {selectedBank} cards?</h3>
                      <p className="text-xs text-neutral-500">
                        If enabled, spends on linked cards will reduce the same limit, while statements stay separate.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const next = !shareLimit;
                        setShareLimit(next);
                        setSharedWithCardIds(next ? existingCardsForBank.map((item) => item.id) : []);
                      }}
                      className={`relative h-7 w-14 rounded-full transition ${shareLimit ? "bg-emerald-500" : "bg-neutral-300"}`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${shareLimit ? "left-8" : "left-1"}`}
                      />
                    </button>
                  </div>

                  {shareLimit && (
                    <div className="grid gap-2">
                      {existingCardsForBank.map((existingCard) => {
                        const checked = sharedWithCardIds.includes(existingCard.id);
                        return (
                          <label
                            key={existingCard.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm"
                          >
                            <div>
                              <div className="font-semibold">{existingCard.name}</div>
                              <div className="text-xs text-neutral-500">
                                {existingCard.network} • {existingCard.last4} • ₹{existingCard.creditLimit.toLocaleString("en-IN")}
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                const next = event.target.checked;
                                setSharedWithCardIds((prev) =>
                                  next ? Array.from(new Set([...prev, existingCard.id])) : prev.filter((id) => id !== existingCard.id)
                                );
                              }}
                              className="h-5 w-5 rounded border-neutral-300"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Card Last 4 Digits</label>
                <input
                  type="text"
                  value={last4}
                  maxLength={4}
                  inputMode="numeric"
                  placeholder="1234"
                  onChange={(event) => {
                    const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 4);
                    setLast4(digitsOnly);
                  }}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2"
                />
                <p className="text-xs text-neutral-500">Used on card illustration. Enter exactly 4 digits.</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Credit Limit</label>
                <input
                  type="number"
                  value={creditLimit}
                  min={0}
                  onChange={(event) => setCreditLimit(Number(event.target.value))}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Reward Type</label>
                <select
                  value={rewardType}
                  onChange={(event) => setRewardType(event.target.value as CardType)}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2"
                >
                  <option value="cashback">Cashback</option>
                  <option value="rewards">Rewards</option>
                  <option value="miles">Miles</option>
                </select>
              </div>
            </div>
          )}

          {step === 6 && selectedCard && (
            <div className="grid gap-4">
              <div className="glass-panel p-5">
                <h3 className="text-lg font-semibold">Review & Confirm</h3>
                <div className="mt-3 grid gap-2 text-sm text-neutral-600">
                  <div>Bank: {selectedCard.bank}</div>
                  <div>Card: {selectedCard.name}</div>
                  <div>Last 4 Digits: {last4 || "Not set"}</div>
                  <div>Network: {selectedNetwork} {selectedSubNetwork ? `- ${selectedSubNetwork}` : ""}</div>
                  <div>Statement Day: {statementDate}</div>
                  <div>Due Day: {dueDate}</div>
                  <div>Credit Limit: ₹{creditLimit.toLocaleString("en-IN")}</div>
                  <div>Reward Type: {rewardType}</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-white/60 flex justify-between">
          <button
            className="px-5 py-2 rounded-full text-sm font-semibold text-neutral-500"
            onClick={() => (step === 1 ? onClose() : setStep((prev) => prev - 1))}
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <div className="flex gap-3">
            {step < 6 && (
              <button
                className="px-5 py-2 rounded-full bg-neutral-900 text-white text-sm font-semibold"
                onClick={() => setStep((prev) => prev + 1)}
                disabled={
                  (step === 1 && !selectedBank) ||
                  (step === 2 && !selectedCard) ||
                  (step === 5 && shareLimit && sharedWithCardIds.length === 0) ||
                  (step === 5 && !/^\d{4}$/.test(last4))
                }
              >
                Continue
              </button>
            )}
            {step === 6 && (
              <button
                className="px-5 py-2 rounded-full bg-neutral-900 text-white text-sm font-semibold"
                onClick={handleAdd}
                disabled={!/^\d{4}$/.test(last4)}
              >
                Add Card
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}