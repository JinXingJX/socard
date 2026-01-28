import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CardDisplay from './CardDisplay';
import type { CardData } from '../types';

const mockCard: CardData = {
  id: 'test-id',
  name: 'Shadow Knight',
  description: 'A dark warrior from the abyss.',
  rarity: 'Epic',
  stats: { attack: 75, defense: 60 },
  imageUrl: 'data:image/png;base64,placeholder',
  visualPrompt: 'test prompt',
  varList: {},
};

describe('CardDisplay', () => {
  it('renders the card name', () => {
    render(<CardDisplay data={mockCard} />);
    expect(screen.getByText('Shadow Knight')).toBeInTheDocument();
  });

  it('renders attack and defense stats', () => {
    render(<CardDisplay data={mockCard} />);
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('renders the rarity label', () => {
    render(<CardDisplay data={mockCard} />);
    expect(screen.getByText('Epic')).toBeInTheDocument();
  });
});
