import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { generateCardMetadata, generateCardImage } from './services/geminiService';
import { mintCardToken } from './services/solanaService';
import { CardData, GenerationStatus } from './types';
import CardDisplay from './components/CardDisplay';
import SolanaWallet from './components/SolanaWallet';
import BlinkPreview from './components/BlinkPreview';
import { Wand2, Zap, LayoutTemplate, Coins, CheckCircle2, ArrowRight, Share2 } from 'lucide-react';

const App: React.FC = () => {
  const { connected, publicKey, signTransaction } = useWallet();
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<GenerationStatus>({ step: 'idle', message: '' });
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [mintedTx, setMintedTx] = useState<string | null>(null);
  const [showBlink, setShowBlink] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Reset state
    setCardData(null);
    setMintedTx(null);
    setShowBlink(false);
    setStatus({ step: 'analyzing', message: 'Consulting the Oracle...' });

    try {
      // Step 1: Metadata
      const metadata = await generateCardMetadata(prompt);
      setStatus({ step: 'painting', message: 'Forging Visuals...' });

      // Step 2: Image
      const imageUrl = await generateCardImage(metadata.visualPrompt);

      setCardData({
        ...metadata,
        id: crypto.randomUUID(),
        imageUrl,
      });

      setStatus({ step: 'complete', message: 'Card Forged!' });
    } catch (error) {
      console.error(error);
      setStatus({ step: 'error', message: 'The forge failed. Try again.' });
    }
  };

  const handleMintETF = async () => {
    if (!connected || !publicKey || !signTransaction) {
      alert("Please connect your wallet first.");
      return;
    }
    setIsMinting(true);
    try {
      const txHash = await mintCardToken(publicKey, signTransaction);
      setMintedTx(txHash);
    } catch (error) {
      console.error('Mint failed:', error);
      alert('Minting failed. Make sure you are on Solana devnet and have SOL.');
    } finally {
      setIsMinting(false);
    }
  };

  const handleCreateBlink = () => {
    setShowBlink(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a14]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-6 h-6 text-purple-400" />
            <span className="font-display font-bold text-xl tracking-wider">SOL<span className="text-purple-400">FORGE</span></span>
          </div>
          <SolanaWallet />
        </div>
      </header>

      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">

          {/* Left Column: Input & Controls */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">ETF Token</span> Cards
                <br />
                <span className="text-2xl md:text-3xl text-gray-400 font-normal">Powered by Gemini & Solana</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-lg">
                Enter a simple phrase. Our AI Director will craft a high-fidelity TCG card, ready to be minted as a fractionalized ETF asset on Solana.
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm">
              <label className="block text-sm font-medium text-gray-400 mb-2">Card Theme / Concept</label>
              <div className="relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A cybernetic samurai in a neon rainstorm, glitch aesthetic"
                  className="w-full bg-black/50 border border-gray-700 rounded-xl py-4 pl-4 pr-12 text-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-600"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                  onClick={handleGenerate}
                  disabled={status.step === 'analyzing' || status.step === 'painting'}
                  className="absolute right-2 top-2 bottom-2 aspect-square bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status.step === 'analyzing' || status.step === 'painting' ? (
                    <Zap className="w-5 h-5 animate-pulse" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Status Indicators */}
              <div className="mt-4 flex items-center gap-3 text-sm h-6">
                 {status.step !== 'idle' && (
                   <>
                    <span className={`flex items-center gap-2 ${status.step === 'analyzing' ? 'text-blue-400' : 'text-gray-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${status.step === 'analyzing' ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`} />
                      Analyzing
                    </span>
                    <span className="w-8 h-[1px] bg-gray-800" />
                    <span className={`flex items-center gap-2 ${status.step === 'painting' ? 'text-purple-400' : 'text-gray-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${status.step === 'painting' ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`} />
                      Painting
                    </span>
                    <span className="w-8 h-[1px] bg-gray-800" />
                    <span className={`flex items-center gap-2 ${status.step === 'complete' ? 'text-green-400' : 'text-gray-600'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      Ready
                    </span>
                   </>
                 )}
                 {status.step === 'error' && <span className="text-red-400">{status.message}</span>}
              </div>
            </div>

            {/* Mint & Blink Controls */}
            {cardData && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-900/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-white">Mint ETF Token</h3>
                      <p className="text-sm text-gray-400">Deploy this card as a liquid token on Solana</p>
                    </div>
                    <Coins className="text-yellow-500 w-8 h-8" />
                  </div>

                  {!mintedTx ? (
                    <button
                      onClick={handleMintETF}
                      disabled={isMinting || !connected}
                      className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold font-display tracking-wide shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:grayscale"
                    >
                      {isMinting ? 'Confirming Transaction...' : !connected ? 'Connect Wallet to Mint' : 'Mint Card Token (Devnet)'}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Token Minted! Tx: {mintedTx.slice(0, 8)}...{mintedTx.slice(-8)}
                      </div>

                      {!showBlink ? (
                        <button
                          onClick={handleCreateBlink}
                          className="w-full py-3 rounded-lg bg-[#2a2a35] hover:bg-[#32323f] border border-gray-700 text-white font-bold font-display tracking-wide shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group"
                        >
                          <Share2 className="w-4 h-4 text-blue-400" />
                          Create Sell Blink (One-Click)
                        </button>
                      ) : (
                         <div className="animate-in fade-in slide-in-from-top-4">
                            <BlinkPreview data={cardData} mintedTx={mintedTx} />
                         </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Card Display */}
          <div className="flex flex-col items-center justify-center relative">
            {/* Background Decorative Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen" />

            {cardData ? (
              <div className="animate-in zoom-in duration-500">
                <CardDisplay data={cardData} />
              </div>
            ) : (
              <div className="w-[340px] h-[520px] rounded-xl border-2 border-dashed border-gray-800 bg-gray-900/30 flex flex-col items-center justify-center text-gray-600 gap-4">
                <Wand2 className="w-12 h-12 opacity-20" />
                <span className="font-display tracking-widest text-sm opacity-40">AWAITING INPUT</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
