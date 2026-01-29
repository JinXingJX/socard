import React, { useState } from 'react';
import { CardData } from '../types';
import { ExternalLink, Copy, Check, Link2, X } from 'lucide-react';

interface BlinkPreviewProps {
  data: CardData;
  mintedTx: string;
}

const BlinkPreview: React.FC<BlinkPreviewProps> = ({ data, mintedTx }) => {
  const actionUrl = `${window.location.origin}/api/actions/buy?cardId=${data.id}&amount=${data.priceSol}`;
  const blinkUrl = `https://dial.to/?action=solana-action:${encodeURIComponent(actionUrl)}`;
  const [copied, setCopied] = useState(false);
  const [showFullBlink, setShowFullBlink] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(blinkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname + parsed.search;
      return `${parsed.host}${path}`;
    } catch {
      return url;
    }
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

      {/* Social Card Preview (Compact) */}
      <div className="p-4">
        <div className="border border-gray-700 rounded-lg overflow-hidden bg-[#1a1b23] p-3">
          <div className="flex items-center gap-2">
            <h3 className="text-gray-100 font-bold text-sm truncate flex-1">
              {data.name} // ETF Asset
            </h3>
            <button
              onClick={() => setShowFullBlink(true)}
              className="px-2 py-1 text-[10px] rounded bg-gray-800/60 text-gray-200 hover:bg-gray-700/60 transition-colors"
              title="Open full Action preview"
            >
              Preview
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 bg-black/40 p-2 rounded border border-gray-800/50 group hover:border-purple-500/30 transition-colors">
            <Link2 className="w-3 h-3 text-purple-400 shrink-0" />
            <span className="text-xs text-blue-400 truncate flex-1 font-mono" title={blinkUrl}>
              {formatUrl(blinkUrl)}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 hover:text-white transition-all"
              title="Copy Blink URL"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1">
        <p className="text-[10px] text-yellow-500/70 px-1">
          Note: dial.to cannot reach localhost. Use <code className="bg-black/40 px-1 rounded">ngrok http 3011</code> for external access.
        </p>
      </div>
      {showFullBlink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl rounded-xl border border-gray-700 bg-[#0f1016] shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <div className="text-sm font-semibold text-gray-200">Full Blink URL</div>
              <button
                onClick={() => setShowFullBlink(false)}
                className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="border border-gray-700 rounded-lg overflow-hidden bg-[#1a1b23]">
                <div className="relative h-56 w-full overflow-hidden">
                  <img src={data.imageUrl} alt="Blink Cover" className="w-full h-full object-contain bg-black" />
                </div>
                <div className="p-4 -mt-8 relative">
                  <h3 className="text-gray-100 font-bold text-base">{data.name} // ETF Asset</h3>
                  <p className="text-gray-400 text-xs mt-1">{data.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>Price: <span className="text-gray-200">{data.priceSol} SOL</span></div>
                    <div>Rarity: <span className="text-gray-200">{data.rarity}</span></div>
                    <div className="col-span-2 truncate">Mint: <span className="text-gray-200">{data.mintAddress || 'Pending'}</span></div>
                    <div className="col-span-2 truncate">Tx: <span className="text-gray-200">{mintedTx}</span></div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{window.location.host}</span>
                  </div>
                  <div className="mt-3">
                    <button className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 px-3 rounded-md transition-colors">
                      Buy {data.priceSol} SOL
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Blink Link</div>
                <div className="bg-black/40 border border-gray-800 rounded-lg p-3 font-mono text-xs text-blue-300 break-all">
                  {blinkUrl}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Action URL</div>
                <div className="bg-black/40 border border-gray-800 rounded-lg p-3 font-mono text-xs text-gray-300 break-all">
                  {actionUrl}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(blinkUrl)}
                  className="px-3 py-2 rounded-md bg-gray-800/70 text-gray-200 text-xs hover:bg-gray-700/70 transition-colors"
                >
                  Copy Full URL
                </button>
                <button
                  onClick={() => setShowFullBlink(false)}
                  className="px-3 py-2 rounded-md bg-purple-600 text-white text-xs hover:bg-purple-500 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlinkPreview;
