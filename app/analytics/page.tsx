"use client";
import React, { useMemo } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { useTransactions } from "../../hooks/useTransactions";
import { useCards } from "../../hooks/useCards";
import { getCategoryMeta } from "../../lib/categoryMeta";

const categoryColors = [
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#e11d48",
  "#6366f1",
  "#14b8a6",
  "#facc15",
  "#8b5cf6",
  "#ec4899",
  "#64748b"
];


export default function Analytics() {
  const { transactions } = useTransactions();
  const { cards } = useCards();

  const { totalSpends, categoryData, cardBreakdown } = useMemo(() => {
    const totals: Record<string, number> = {};
    const cardMap = new Map(cards.map((card) => [card.id, card]));
    const cardTotals: Record<string, { total: number; categories: Record<string, number>; cardLabel: string }> = {};

    const visibleTransactions = transactions.filter((tx) => tx.status !== "paid");

    visibleTransactions.forEach((tx) => {
      totals[tx.category] = (totals[tx.category] ?? 0) + tx.amount;

      const existingCard = cardTotals[tx.cardId] ?? {
        total: 0,
        categories: {},
        cardLabel: cardMap.get(tx.cardId)
          ? `${cardMap.get(tx.cardId)?.bank} • ${cardMap.get(tx.cardId)?.name}`
          : `Card ${tx.cardId.slice(-6).toUpperCase()}`
      };

      existingCard.total += tx.amount;
      existingCard.categories[tx.category] = (existingCard.categories[tx.category] ?? 0) + tx.amount;
      cardTotals[tx.cardId] = existingCard;
    });

    const data = Object.entries(totals).map(([category, value]) => ({ name: category, value }));
    const detailedData = Object.entries(cardTotals)
      .map(([cardId, details]) => ({
        cardId,
        cardLabel: details.cardLabel,
        total: details.total,
        categories: Object.entries(details.categories)
          .map(([category, value]) => ({ category, value }))
          .sort((a, b) => b.value - a.value)
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totalSpends: visibleTransactions.reduce((acc, curr) => acc + curr.amount, 0),
      categoryData: data,
      cardBreakdown: detailedData
    };
  }, [transactions, cards]);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold">Analytics</h1>
        <p className="text-neutral-500">A combined view of current spends and category splits.</p>
      </header>

      <div className="glass-panel p-6 grid gap-6 lg:grid-cols-[320px_1fr] items-stretch">
        <div>
          <p className="text-sm text-neutral-500">Total Lifetime Spend</p>
          <p className="text-4xl font-semibold mt-2">₹{totalSpends.toLocaleString("en-IN")}</p>
          <p className="text-sm text-neutral-500 mt-3">All cards combined, local-only data.</p>
        </div>
        <div className="h-72 w-full min-w-0 self-stretch">
          {categoryData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-neutral-500">
              Add transactions to see category breakdowns.
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

      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Detailed Spend Breakdown</h2>
            <p className="text-sm text-neutral-500">How much spent on each card, split by category.</p>
          </div>
          <p className="text-sm text-neutral-500">{cardBreakdown.length} cards</p>
        </div>

        {cardBreakdown.length === 0 ? (
          <div className="rounded-3xl border border-white/50 bg-white/40 px-5 py-10 text-center text-sm text-neutral-500">
            No card spend data yet. Add transactions to see card-wise category totals.
          </div>
        ) : (
          <div className="space-y-3">
            {cardBreakdown.map((item) => (
              <div
                key={item.cardId}
                className="rounded-3xl border border-white/60 bg-white/40 p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm sm:text-base font-semibold text-neutral-900">{item.cardLabel}</p>
                  <p className="text-base sm:text-lg font-semibold text-neutral-900">
                    ₹{item.total.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.categories.map((categoryItem) => {
                    const meta = getCategoryMeta(categoryItem.category);
                    const CategoryIcon = meta.icon;
                    return (
                      <div
                        key={`${item.cardId}-${categoryItem.category}`}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1.5 border border-neutral-200"
                      >
                        <span
                          className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full ${meta.iconClassName}`}
                        >
                          <CategoryIcon className="h-3 w-3" />
                        </span>
                        <span className="text-xs font-medium text-neutral-700">{meta.label}</span>
                        <span className="text-xs font-semibold text-neutral-900">
                          ₹{categoryItem.value.toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
