import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SolanaWallet from './SolanaWallet';

// Mock wallet adapter hooks
vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: null,
    connected: false,
    connecting: false,
    disconnect: vi.fn(),
  }),
}));

vi.mock('@solana/wallet-adapter-react-ui', () => ({
  useWalletModal: () => ({
    setVisible: vi.fn(),
  }),
}));

describe('SolanaWallet', () => {
  it('renders the connect button when not connected', () => {
    render(<SolanaWallet />);
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
  });
});
