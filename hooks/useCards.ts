"use client";

import { useState, useEffect, useCallback } from "react";
import type { Card } from "../types";
import { getLocal, setLocal } from "../lib/storage";
import importedCards from "../data/imported/cards.json";
import { maybeCreateAutoBackup } from "../lib/backupManager";

const STORAGE_KEY = "cards";

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    const localCards = getLocal<Card[]>(STORAGE_KEY, []);
    if (localCards.length > 0) {
      setCards(localCards);
      maybeCreateAutoBackup(localCards, getLocal("transactions", []));
      setLoading(false);
      return;
    }

    const seededCards = importedCards as Card[];
    if (seededCards.length > 0) {
      setLocal(STORAGE_KEY, seededCards);
      setCards(seededCards);
      maybeCreateAutoBackup(seededCards, getLocal("transactions", []));
      setLoading(false);
      return;
    }

    setCards([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const addCard = useCallback(
    async (newCard: Omit<Card, "id" | "created_at" | "user_id">) => {
      const cardWithId: Card = {
        ...newCard,
        id: crypto.randomUUID(),
        user_id: "",
        created_at: new Date().toISOString()
      };
      setCards((prev) => {
        const updated = [...prev, cardWithId];
        setLocal(STORAGE_KEY, updated);
        maybeCreateAutoBackup(updated, getLocal("transactions", []));
        return updated;
      });
    },
    []
  );

  const updateCard = useCallback(async (cardOrId: Card | string, updates?: Partial<Card>) => {
    setCards((prev) => {
      const next = [...prev];
      const index =
        typeof cardOrId === "string"
          ? next.findIndex((c) => c.id === cardOrId)
          : next.findIndex((c) => c.id === cardOrId.id);

      if (index === -1) {
        return prev;
      }

      const current = next[index];
      const updatedCard = typeof cardOrId === "string" ? { ...current, ...(updates ?? {}) } : cardOrId;
      next[index] = updatedCard;
      setLocal(STORAGE_KEY, next);
      maybeCreateAutoBackup(next, getLocal("transactions", []));
      return next;
    });
  }, []);

  const deleteCard = useCallback(async (cardId: string) => {
    setCards((prev) => {
      const updated = prev.filter((c) => c.id !== cardId);
      setLocal(STORAGE_KEY, updated);
      maybeCreateAutoBackup(updated, getLocal("transactions", []));
      return updated;
    });
  }, []);

  const replaceCards = useCallback(async (newCards: Card[]) => {
    setCards(newCards);
    setLocal(STORAGE_KEY, newCards);
    maybeCreateAutoBackup(newCards, getLocal("transactions", []));
  }, []);

  return { cards, loading, error, addCard, updateCard, deleteCard, refetch: fetchCards, replaceCards };
}
