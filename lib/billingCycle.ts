import { getDate, setDate, subMonths, isAfter, isEqual, isBefore } from 'date-fns';
import { Transaction, UserCard } from '../types';

export function getLastStatementDate(statementDay: number, referenceDate: Date = new Date()) {
  const currentDay = getDate(referenceDate);
  const anchorMonth = currentDay >= statementDay ? referenceDate : subMonths(referenceDate, 1);
  return setDate(anchorMonth, statementDay);
}

export function getStatementPeriod(statementDay: number, referenceDate: Date = new Date()) {
  const lastStatementDate = getLastStatementDate(statementDay, referenceDate);
  const previousStatementDate = setDate(subMonths(lastStatementDate, 1), statementDay);
  const startDate = previousStatementDate;
  const endDate = lastStatementDate;
  return { startDate, endDate, previousStatementDate, lastStatementDate };
}

export function calculateDueDate(statementDay: number, gracePeriodDays: number, referenceDate: Date = new Date()) {
  const lastStatementDate = getLastStatementDate(statementDay, referenceDate);
  const dueDate = new Date(lastStatementDate);
  dueDate.setDate(dueDate.getDate() + gracePeriodDays);
  return dueDate;
}

export function categorizeTransactions(transactions: Transaction[], card: UserCard, referenceDate: Date = new Date()) {
  const { previousStatementDate, lastStatementDate } = getStatementPeriod(card.statementDate, referenceDate);

  const unbilled: Transaction[] = [];
  const billed: Transaction[] = [];
  const paid: Transaction[] = [];

  transactions.forEach((tx) => {
    if (tx.status === 'paid') {
      paid.push(tx);
      return;
    }

    const txDate = new Date(tx.date);

    if (isAfter(txDate, lastStatementDate)) {
      unbilled.push({ ...tx, status: 'unbilled' });
      return;
    }

    if (isAfter(txDate, previousStatementDate) || isEqual(txDate, lastStatementDate) || isEqual(txDate, previousStatementDate)) {
      billed.push({ ...tx, status: 'billed' });
      return;
    }

    if (isBefore(txDate, previousStatementDate)) {
      billed.push({ ...tx, status: 'billed' });
    }
  });

  return { unbilled, billed, paid };
}
