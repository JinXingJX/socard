import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

import '@solana/wallet-adapter-react-ui/styles.css';

const WalletProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const endpoint = useMemo(
    () => (import.meta.env.VITE_HELIUS_RPC_URL as string | undefined)?.trim() || clusterApiUrl('devnet'),
    [],
  );
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProviderWrapper;
