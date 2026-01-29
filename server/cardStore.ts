import type { CardData } from '../types';

const cards = new Map<string, CardData>();

export function saveCard(card: CardData): void {
  cards.set(card.id, card);
}

export function getCard(id: string): CardData | undefined {
  return cards.get(id);
}
