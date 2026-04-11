import type { Card, Transaction } from "../types";

export type BackupSource = "auto" | "manual";

export type BackupSnapshot = {
  id: string;
  createdAt: string;
  source: BackupSource;
  label: string;
  cards: Card[];
  transactions: Transaction[];
};

const BACKUPS_KEY = "cardx_backups_v1";
const AUTO_BACKUP_ENABLED_KEY = "cardx_auto_backup_enabled";
const LAST_SIGNATURE_KEY = "cardx_auto_backup_signature";
const LAST_BACKUP_AT_KEY = "cardx_auto_backup_last_at";
const AUTO_BACKUP_MIN_INTERVAL_MS = 60 * 1000;
const MAX_BACKUPS = 30;

function canUseStorage() {
  return typeof window !== "undefined";
}

function readBackups(): BackupSnapshot[] {
  if (!canUseStorage()) return [];
  const raw = localStorage.getItem(BACKUPS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BackupSnapshot[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeBackups(backups: BackupSnapshot[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(BACKUPS_KEY, JSON.stringify(backups));
}

function buildSignature(cards: Card[], transactions: Transaction[]) {
  return JSON.stringify({ cards, transactions });
}

export function isAutoBackupEnabled() {
  if (!canUseStorage()) return false;
  const raw = localStorage.getItem(AUTO_BACKUP_ENABLED_KEY);
  if (raw === null) return true;
  return raw === "true";
}

export function setAutoBackupEnabled(enabled: boolean) {
  if (!canUseStorage()) return;
  localStorage.setItem(AUTO_BACKUP_ENABLED_KEY, String(enabled));
}

export function listBackups() {
  return readBackups().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createBackup(cards: Card[], transactions: Transaction[], source: BackupSource, label?: string) {
  if (!canUseStorage()) return null;

  const snapshot: BackupSnapshot = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source,
    label: label ?? (source === "manual" ? "Manual backup" : "Auto backup"),
    cards,
    transactions
  };

  const existing = readBackups();
  const next = [snapshot, ...existing].slice(0, MAX_BACKUPS);
  writeBackups(next);
  return snapshot;
}

export function maybeCreateAutoBackup(cards: Card[], transactions: Transaction[]) {
  if (!canUseStorage() || !isAutoBackupEnabled()) return;
  if (cards.length === 0 && transactions.length === 0) return;

  const now = Date.now();
  const lastAt = Number(localStorage.getItem(LAST_BACKUP_AT_KEY) ?? 0);
  const signature = buildSignature(cards, transactions);
  const lastSignature = localStorage.getItem(LAST_SIGNATURE_KEY) ?? "";

  if (signature === lastSignature) {
    return;
  }

  if (now - lastAt < AUTO_BACKUP_MIN_INTERVAL_MS) {
    localStorage.setItem(LAST_SIGNATURE_KEY, signature);
    return;
  }

  createBackup(cards, transactions, "auto", "Auto backup");
  localStorage.setItem(LAST_SIGNATURE_KEY, signature);
  localStorage.setItem(LAST_BACKUP_AT_KEY, String(now));
}

export function deleteBackup(backupId: string) {
  const next = readBackups().filter((backup) => backup.id !== backupId);
  writeBackups(next);
}

export function getBackupById(backupId: string) {
  return readBackups().find((backup) => backup.id === backupId) ?? null;
}

export function exportBackupAsJson(cards: Card[], transactions: Transaction[]) {
  return JSON.stringify(
    {
      version: 1,
      createdAt: new Date().toISOString(),
      cards,
      transactions
    },
    null,
    2
  );
}
