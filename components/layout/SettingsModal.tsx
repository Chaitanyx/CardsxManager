"use client";

import React, { useRef, useState } from "react";
import { exportAllToCsv, importAllFromCsv } from "../../lib/csvExport";
import { useCards } from "../../hooks/useCards";
import { useTransactions } from "../../hooks/useTransactions";
import {
  createBackup,
  deleteBackup,
  exportBackupAsJson,
  getBackupById,
  isAutoBackupEnabled,
  listBackups,
  setAutoBackupEnabled
} from "../../lib/backupManager";

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { cards, replaceCards } = useCards();
  const { transactions, replaceTransactions } = useTransactions();
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [autoBackupEnabled, setAutoBackupEnabledState] = useState(isAutoBackupEnabled());
  const [backups, setBackups] = useState(listBackups());

  if (!isOpen) return null;

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

  const handleExportJson = () => {
    const json = exportBackupAsJson(cards, transactions);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cardxmanager-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isValidImportPayload = (payload: unknown): payload is { cards: typeof cards; transactions: typeof transactions } => {
    return !!payload && typeof payload === "object" && Array.isArray((payload as { cards?: unknown }).cards) && Array.isArray((payload as { transactions?: unknown }).transactions);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      let importedCards = [] as typeof cards;
      let importedTransactions = [] as typeof transactions;

      if (file.name.toLowerCase().endsWith(".json")) {
        const parsed = JSON.parse(text) as unknown;
        if (!isValidImportPayload(parsed)) {
          setImportStatus("Invalid JSON backup format.");
          return;
        }
        importedCards = parsed.cards;
        importedTransactions = parsed.transactions;
      } else {
        const parsed = importAllFromCsv(text);
        importedCards = parsed.cards;
        importedTransactions = parsed.transactions;
      }

      replaceCards(importedCards);
      replaceTransactions(importedTransactions);
      createBackup(importedCards, importedTransactions, "manual", "Post-import snapshot");
      setBackups(listBackups());
      setImportStatus(`Imported ${importedCards.length} cards and ${importedTransactions.length} transactions.`);
    } catch {
      setImportStatus("Import failed. Please use a valid CSV or JSON backup file.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreateBackup = () => {
    createBackup(cards, transactions, "manual", "Manual backup");
    setBackups(listBackups());
    setImportStatus("Manual backup created.");
  };

  const handleRestoreBackup = (backupId: string) => {
    const backup = getBackupById(backupId);
    if (!backup) {
      setImportStatus("Backup not found.");
      return;
    }
    replaceCards(backup.cards);
    replaceTransactions(backup.transactions);
    setImportStatus(`Restored backup from ${new Date(backup.createdAt).toLocaleString()}.`);
  };

  const handleDeleteBackup = (backupId: string) => {
    deleteBackup(backupId);
    setBackups(listBackups());
  };

  const handleToggleAutoBackup = () => {
    const next = !autoBackupEnabled;
    setAutoBackupEnabled(next);
    setAutoBackupEnabledState(next);
    setImportStatus(`Auto backup ${next ? "enabled" : "disabled"}.`);
  };

  const handleClear = () => {
    replaceCards([]);
    replaceTransactions([]);
    createBackup([], [], "manual", "After clear backup");
    setBackups(listBackups());
    setImportStatus("All local data cleared.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="glass-panel-strong w-full max-w-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Settings</h2>
          <button onClick={onClose} className="text-sm font-semibold text-neutral-500 hover:text-neutral-800">
            Close
          </button>
        </div>

        <div className="grid gap-6">
          <div className="glass-panel p-5">
            <h3 className="text-lg font-semibold mb-2">Data Safety</h3>
            <p className="text-sm text-neutral-600 mb-4">Import CSV/JSON, export backups, and restore snapshots easily.</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="rounded-full bg-neutral-900 text-white px-5 py-2 text-sm font-semibold"
              >
                Export CSV
              </button>
              <button
                onClick={handleExportJson}
                className="rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-semibold"
              >
                Export JSON
              </button>
              <label className="rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-semibold cursor-pointer">
                Import CSV/JSON
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleCreateBackup}
                className="rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-semibold"
              >
                Create Backup
              </button>
              <button
                onClick={handleClear}
                className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600"
              >
                Clear All Data
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-neutral-800">Auto backup</p>
                <p className="text-xs text-neutral-500">Creates periodic snapshots as your cards/spends change.</p>
              </div>
              <button
                onClick={handleToggleAutoBackup}
                className={`relative h-7 w-14 rounded-full transition ${autoBackupEnabled ? "bg-emerald-500" : "bg-neutral-300"}`}
                aria-pressed={autoBackupEnabled}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${autoBackupEnabled ? "left-8" : "left-1"}`} />
              </button>
            </div>
            {importStatus && <p className="mt-3 text-sm text-neutral-500">{importStatus}</p>}
          </div>

          <div className="glass-panel p-5">
            <h3 className="text-lg font-semibold mb-2">Backup History</h3>
            <p className="text-sm text-neutral-600 mb-4">Restore any snapshot in one click.</p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {backups.length === 0 && <p className="text-sm text-neutral-500">No backups yet.</p>}
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{backup.label}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(backup.createdAt).toLocaleString()} • {backup.source} • {backup.cards.length} cards • {backup.transactions.length} tx
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestoreBackup(backup.id)}
                      className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-5">
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-sm text-neutral-600">Powered by CardXManager (c) Zedgo Glicheze.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
