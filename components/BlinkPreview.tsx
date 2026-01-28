import React, { useState } from 'react';
import { CardData } from '../types';
import { ExternalLink, Copy, Check } from 'lucide-react';

interface BlinkPreviewProps {
  data: CardData;
  mintedTx: string;
}

const BlinkPreview: React.FC<BlinkPreviewProps> = ({ data, mintedTx }) => {
  const blinkUrl = `https://dial.to/?action=solana-action:${mintedTx}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(blinkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-6 bg-[#12141a] rounded-xl overflow-hidden border border-gray-700 shadow-2xl mx-auto ring-1 ring-white/10">
      {/* Header */}
      <div className="bg-[#0f1016] px-3 py-2 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">X</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Solana Action Preview</span>
        </div>
      </div>

      {/* Social Card Preview */}
      <div className="p-4">
        <div className="border border-gray-700 rounded-lg overflow-hidden bg-[#1a1b23]">
            {/* Card Image */}
            <div className="relative h-48 w-full overflow-hidden">
                <img src={data.imageUrl} alt="Blink Cover" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b23] to-transparent opacity-60"></div>
            </div>
            
            {/* Card Content */}
            <div className="p-3 relative -mt-8">
                <h3 className="text-gray-100 font-bold text-sm truncate">{data.name} // ETF Asset</h3>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">{data.description}</p>
                
                {/* Simulated Action Domain */}
                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>solana-actions.vercel.app</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-3 pb-3 flex gap-2">
                <button className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 text-xs font-bold py-2 px-3 rounded-md transition-colors">
                    Buy 1 SOL
                </button>
                <button className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 px-3 rounded-md transition-colors">
                    Buy 10 SOL
                </button>
            </div>
        </div>
      </div>

      {/* Explorer Link */}
      <div className="px-4 pt-2">
        <a
          href={`https://explorer.solana.com/tx/${mintedTx}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View transaction on Solana Explorer
        </a>
      </div>

      {/* Share Section */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-gray-800/50 group hover:border-purple-500/30 transition-colors">
            <span className="text-xs text-blue-400 truncate flex-1 font-mono">{blinkUrl}</span>
            <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition-all"
                title="Copy Blink URL"
            >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[10px] text-gray-500">
                Post this link to unfurl the Action
            </p>
            <span className="text-[10px] text-purple-400 flex items-center gap-1">
                Powered by Blinks <ExternalLink className="w-2 h-2" />
            </span>
        </div>
      </div>
    </div>
  );
};

export default BlinkPreview;