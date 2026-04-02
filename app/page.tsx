"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { useCards } from "../hooks/useCards";
import { useTransactions } from "../hooks/useTransactions";
import AddCardModal from "../components/cards/AddCardModal";
import AddSpendModal from "../components/cards/AddSpendModal";
import { CardIllustration } from "../components/cards/CardIllustration";
import { categorizeTransactions } from "../lib/billingCycle";
import { getSharedLimitSummary } from "../lib/limitSharing";
import { SettingsModal } from "../components/layout/SettingsModal";
import { EmptyState } from "../components/ui/EmptyState";

export default function Home() {
  const { cards, addCard, updateCard } = useCards();
  const { transactions, addTransaction } = useTransactions();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [activeSpendCardId, setActiveSpendCardId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeSpendCard = useMemo(
    () => cards.find((card) => card.id === activeSpendCardId) ?? null,
    [activeSpendCardId, cards]
  );

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    transactions.forEach((tx) => {
      totals[tx.category] = (totals[tx.category] ?? 0) + tx.amount;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const categoryColors = ["#0ea5e9", "#22c55e", "#f97316", "#e11d48", "#6366f1", "#14b8a6", "#facc15"];

  if (!isMounted) {
    return (
      <section className="p-8 max-w-5xl mx-auto">
        <div className="glass-panel p-6 text-neutral-500">Loading cards...</div>
      </section>
    );
  }

  return (
    <section className="p-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">My Cards</h1>
          <p className="text-neutral-500">Track spends, rewards, and statement status locally.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-semibold"
          >
            Settings
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="rounded-full bg-neutral-900 text-white px-6 py-2 text-sm font-semibold"
          >
            + Add Card
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          title="No cards added yet"
          subtitle='Tap "Add Card" to start tracking your spends.'
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const cardTransactions = transactions.filter((tx) => tx.cardId === card.id);
            const { unbilled, billed } = categorizeTransactions(cardTransactions, card);
            const unbilledTotal = unbilled.reduce((acc, tx) => acc + tx.amount, 0);
            const billedTotal = billed.reduce((acc, tx) => acc + tx.amount, 0);
            const sharedLimitSummary = getSharedLimitSummary(cards, transactions, card);

            return (
              <CardIllustration
                key={card.id}
                card={card}
                unbilledTotal={unbilledTotal}
                billedTotal={billedTotal}
                sharedLimitSummary={sharedLimitSummary}
                onAddSpend={() => setActiveSpendCardId(card.id)}
              />
            );
          })}
        </div>
      )}

      {isAddModalOpen && (
        <AddCardModal
          cards={cards}
          onClose={() => setAddModalOpen(false)}
          onAdd={(card) => {
            addCard(card);
            setAddModalOpen(false);
          }}
          onUpdateCard={updateCard}
        />
      )}

      {activeSpendCard && (
        <AddSpendModal
          card={activeSpendCard}
          onClose={() => setActiveSpendCardId(null)}
          onAdd={(tx) => {
            addTransaction(tx);
            setActiveSpendCardId(null);
          }}
        />
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />

      <div className="mt-12 glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Spend Analysis</h2>
          <span className="text-sm text-neutral-500">All cards combined</span>
        </div>
        <div className="h-72 w-full min-w-0">
          {categoryData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-neutral-500">
              Add transactions to see category splits.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                    return `₹${numericValue.toLocaleString("en-IN")}`;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
