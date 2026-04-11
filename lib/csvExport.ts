import { Transaction, UserCard } from "../types";

const header = [
  "recordType",
  "id",
  "cardId",
  "bankCardId",
  "bank",
  "name",
  "last4",
  "type",
  "network",
  "subNetwork",
  "statementDate",
  "gracePeriodDays",
  "dueDate",
  "creditLimit",
  "sharedLimitGroupId",
  "color1",
  "color2",
  "createdAt",
  "merchant",
  "amount",
  "date",
  "category",
  "isRewardEligible",
  "rewardType",
  "rewardRate",
  "rewardRateMode",
  "rewardUnit",
  "rewardEarned",
  "rewardPointValue",
  "status"
];

function escapeCsv(value: string | number | boolean | undefined | null) {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function exportAllToCsv(cards: UserCard[], transactions: Transaction[]) {
  const rows: string[] = [];
  rows.push(header.join(","));

  cards.forEach((card) => {
    rows.push(
      [
        "card",
        card.id,
        "",
        card.bankCardId,
        card.bank,
        card.name,
        card.last4,
        card.type,
        card.network,
        card.subNetwork,
        card.statementDate,
        card.gracePeriodDays,
        card.dueDate,
        card.creditLimit,
        card.sharedLimitGroupId ?? "",
        card.color[0],
        card.color[1],
        card.createdAt,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
      ].map(escapeCsv).join(",")
    );
  });

  transactions.forEach((tx) => {
    rows.push(
      [
        "transaction",
        tx.id,
        tx.cardId,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        tx.createdAt,
        tx.merchant,
        tx.amount,
        tx.date,
        tx.category,
        tx.isRewardEligible,
        tx.rewardType,
        tx.rewardRate ?? "",
        tx.rewardRateMode ?? "",
        tx.rewardUnit ?? "",
        tx.rewardEarned ?? "",
        tx.rewardPointValue ?? "",
        tx.status
      ].map(escapeCsv).join(",")
    );
  });

  return rows.join("\n");
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  result.push(current);
  return result;
}

export function importAllFromCsv(csvText: string) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) {
    return { cards: [], transactions: [] };
  }

  const rows = lines.slice(1).map(parseCsvLine);
  const cards: UserCard[] = [];
  const transactions: Transaction[] = [];

  rows.forEach((row) => {
    const recordType = row[0];
    const hasSharedLimitColumn = row.length >= 29;
    const hasRewardPointValueColumn = row.length >= 31;
    const cardCreatedAtIndex = hasSharedLimitColumn ? 17 : 16;
    const txCreatedAtIndex = hasSharedLimitColumn ? 17 : 16;
    const txIdx = {
      createdAt: txCreatedAtIndex,
      merchant: txCreatedAtIndex + 1,
      amount: txCreatedAtIndex + 2,
      date: txCreatedAtIndex + 3,
      category: txCreatedAtIndex + 4,
      isRewardEligible: txCreatedAtIndex + 5,
      rewardType: txCreatedAtIndex + 6,
      rewardRate: txCreatedAtIndex + 7,
      rewardRateMode: txCreatedAtIndex + 8,
      rewardUnit: txCreatedAtIndex + 9,
      rewardEarned: txCreatedAtIndex + 10,
      rewardPointValue: txCreatedAtIndex + 11,
      status: txCreatedAtIndex + (hasRewardPointValueColumn ? 12 : 11)
    };

    if (recordType === "card") {
      cards.push({
        id: row[1],
        bankCardId: row[3],
        bank: row[4],
        name: row[5],
        last4: (row[6] || row[1].slice(-4)).replace(/\D/g, "").slice(-4).padStart(4, "0"),
        type: row[7] as UserCard["type"],
        network: row[8] as UserCard["network"],
        subNetwork: row[9],
        statementDate: Number(row[10]),
        gracePeriodDays: Number(row[11]),
        dueDate: Number(row[12]),
        creditLimit: Number(row[13]),
        sharedLimitGroupId: hasSharedLimitColumn ? row[14] || undefined : undefined,
        color: [row[hasSharedLimitColumn ? 15 : 14], row[hasSharedLimitColumn ? 16 : 15]],
        createdAt: row[cardCreatedAtIndex],
        annualFee: 0,
        isLtf: true,
        annualFeeWaiverTarget: 0,
        includePastCumulativeSpend: false,
        pastCumulativeSpend: 0,
        renewalMonth: (row[cardCreatedAtIndex] || new Date().toISOString()).slice(0, 7)
      });
      return;
    }

    if (recordType === "transaction") {
      const statusIndex = row.length - 1;
      const rewardPointValueIndex = row.length - 2;
      const rewardEarnedIndex = row.length - 3;
      const rewardUnitIndex = row.length - 4;
      const rewardRateModeIndex = row.length - 5;
      const rewardRateIndex = row.length - 6;
      const rewardTypeIndex = row.length - 7;
      const isRewardEligibleIndex = row.length - 8;
      const categoryIndex = row.length - 9;
      const dateIndex = row.length - 10;
      const amountIndex = row.length - 11;
      const merchantIndex = row.length - 12;
      const createdAtIndex = row.length - 13;

      transactions.push({
        id: row[1],
        cardId: row[2],
        merchant: row[merchantIndex],
        amount: Number(row[amountIndex]),
        date: row[dateIndex],
        category: row[categoryIndex],
        isRewardEligible: row[isRewardEligibleIndex] === "true",
        rewardType: row[rewardTypeIndex] as Transaction["rewardType"],
        rewardRate: row[rewardRateIndex] ? Number(row[rewardRateIndex]) : undefined,
        rewardRateMode: row[rewardRateModeIndex] as Transaction["rewardRateMode"],
        rewardUnit: (row[rewardUnitIndex] as Transaction["rewardUnit"]) || undefined,
        rewardEarned: row[rewardEarnedIndex] ? Number(row[rewardEarnedIndex]) : undefined,
        rewardPointValue: row[rewardPointValueIndex] ? Number(row[rewardPointValueIndex]) : undefined,
        status: (row[statusIndex] as Transaction["status"]) || "unbilled",
        createdAt: row[createdAtIndex]
      });
    }
  });

  return { cards, transactions };
}
