"use client";

import React, { useRef, useState } from "react";
import { exportAllToCsv, importAllFromCsv } from "../../lib/csvExport";
import { useCards } from "../../hooks/useCards";
import { useTransactions } from "../../hooks/useTransactions";

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { cards, replaceCards } = useCards();
  const { transactions, replaceTransactions } = useTransactions();
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const csv = exportAllToCsv(cards, transactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cardxmanager-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const { cards: importedCards, transactions: importedTransactions } = importAllFromCsv(text);
    replaceCards(importedCards);
    replaceTransactions(importedTransactions);
    setImportStatus(`Imported ${importedCards.length} cards and ${importedTransactions.length} transactions.`);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    replaceCards([]);
    replaceTransactions([]);
    setImportStatus("All local data cleared.");
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold">Settings</h1>
        <p className="text-neutral-600">Manage backups, imports, and privacy controls for your local data.</p>
      </header>

      <div className="grid gap-6">
        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-2">Data Safety</h2>
          <p className="text-sm text-neutral-600 mb-4">Export a CSV backup or restore from a previous snapshot.</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold"
            >
              Export CSV
            </button>
            <label className="rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-semibold cursor-pointer">
              Import CSV
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleClear}
              className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600"
            >
              Clear All Data
            </button>
          </div>
          {importStatus && <p className="mt-3 text-sm text-neutral-500">{importStatus}</p>}
        </div>

        <div className="glass-panel p-6">
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p className="text-sm text-neutral-600">Powered by CardXManager (c) Zedgo Glicheze.</p>
        </div>
      </div>
    </div>
  );
}
