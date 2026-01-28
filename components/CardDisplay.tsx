import React from 'react';
import { CardData } from '../types';
import { Swords, Shield, Star, Sparkles } from 'lucide-react';

interface CardDisplayProps {
  data: CardData;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ data }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'border-gray-400 text-gray-400';
      case 'Rare': return 'border-blue-400 text-blue-400';
      case 'Epic': return 'border-purple-400 text-purple-400';
      case 'Legendary': return 'border-yellow-400 text-yellow-400';
      case 'Mythic': return 'border-red-500 text-red-500';
      default: return 'border-gray-400';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-900';
      case 'Rare': return 'bg-blue-950';
      case 'Epic': return 'bg-purple-950';
      case 'Legendary': return 'bg-yellow-950';
      case 'Mythic': return 'bg-red-950';
      default: return 'bg-gray-900';
    }
  };

  return (
    <div className="relative group perspective-1000 w-[340px] h-[520px]">
      <div className={`holo-card w-full h-full rounded-xl border-[6px] ${getRarityColor(data.rarity)} bg-gray-900 shadow-2xl transform transition-transform duration-500 hover:scale-105 overflow-hidden flex flex-col`}>
        
        {/* Header Name & Rarity Icon */}
        <div className={`h-12 flex items-center justify-between px-3 border-b-2 ${getRarityColor(data.rarity)} ${getRarityBg(data.rarity)}`}>
            <span className="font-card-title font-bold text-lg truncate text-white">{data.name}</span>
            <div className="flex gap-1">
                {data.rarity === 'Legendary' || data.rarity === 'Mythic' ? <Star className="w-4 h-4 fill-current text-yellow-300" /> : null}
                <div className={`w-3 h-3 rounded-full ${getRarityColor(data.rarity).replace('text', 'bg').replace('border', '')}`}></div>
            </div>
        </div>

        {/* Image Area */}
        <div className="relative flex-grow bg-black overflow-hidden group-hover:brightness-110 transition-all">
            <img 
                src={data.imageUrl} 
                alt={data.name} 
                className="w-full h-full object-cover"
            />
            {/* Overlay Gradient at bottom of image for text readability */}
            <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
        </div>

        {/* Description & Stats */}
        <div className="h-[140px] bg-slate-900/95 p-3 flex flex-col justify-between border-t-4 border-double border-gray-600 relative z-10">
            
            <p className="text-xs text-gray-300 italic mb-2 leading-relaxed font-serif">
                "{data.description}"
            </p>

            <div className="flex justify-between items-end mt-auto">
                <div className="flex items-center gap-1 text-red-400 font-display font-bold text-xl">
                    <Swords className="w-5 h-5" />
                    <span>{data.stats.attack}</span>
                </div>
                
                <div className="flex flex-col items-center">
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${getRarityColor(data.rarity)}`}>
                        {data.rarity}
                    </span>
                    <span className="text-[9px] text-gray-500">ETF-TOKEN-ID</span>
                </div>

                <div className="flex items-center gap-1 text-blue-400 font-display font-bold text-xl">
                    <Shield className="w-5 h-5" />
                    <span>{data.stats.defense}</span>
                </div>
            </div>
        </div>
      </div>
      
      {/* Glow Effect behind card */}
      <div className={`absolute -inset-2 bg-gradient-to-r ${data.rarity === 'Mythic' ? 'from-red-500 to-orange-600' : 'from-purple-600 to-blue-600'} rounded-xl blur-lg opacity-20 group-hover:opacity-60 transition duration-500 -z-10`}></div>
    </div>
  );
};

export default CardDisplay;
