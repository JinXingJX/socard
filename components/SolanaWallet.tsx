import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Wallet, Loader2, LogOut } from 'lucide-react';

const SolanaWallet: React.FC = () => {
  const { publicKey, connected, connecting, disconnect, select } = useWallet();
  const { setVisible } = useWalletModal();

  const handleConnect = () => {
    setVisible(true);
  };

  if (connected && publicKey) {
    const display = publicKey.toBase58();
    const short = `${display.slice(0, 4)}...${display.slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/40 border border-purple-500/30 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm font-mono text-purple-200">{short}</span>
        </div>
        <button
          onClick={() => { disconnect(); select(null); }}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/25 disabled:opacity-70"
    >
      {connecting ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Wallet className="w-5 h-5" />
      )}
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

export default SolanaWallet;
