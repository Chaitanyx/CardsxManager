import { useState } from 'react';
import { UserCard } from '../types';
import { getStoredCards, saveCards } from '../lib/storage';

export function useCards() {
  const [cards, setCards] = useState<UserCard[]>(() => getStoredCards());

  const addCard = (card: UserCard) => {
    const updatedCards = [...cards, card];
    setCards(updatedCards);
    saveCards(updatedCards);
  };

  const updateCard = (id: string, updates: Partial<UserCard>) => {
    const updatedCards = cards.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setCards(updatedCards);
    saveCards(updatedCards);
  };

  const removeCard = (id: string) => {
    const updatedCards = cards.filter((c) => c.id !== id);
    setCards(updatedCards);
    saveCards(updatedCards);
  };

  const replaceCards = (nextCards: UserCard[]) => {
    setCards(nextCards);
    saveCards(nextCards);
  };

  return { cards, addCard, updateCard, removeCard, replaceCards };
}
