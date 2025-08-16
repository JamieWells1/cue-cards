'use client';

import { useState } from 'react';
import { CueCard } from '@/types/cue-card';

export default function Home() {
  const [cardName, setCardName] = useState('');
  const [cardData, setCardData] = useState<CueCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) return;

    setLoading(true);
    setError(null);
    setCardData(null);

    try {
      const response = await fetch('/api/card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ card: cardName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch card data');
      }

      const data = await response.json();
      setCardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity?: string | null) => {
    switch (rarity) {
      case 'common': return 'text-gray-500';
      case 'rare': return 'text-yellow-600';
      case 'epic': return 'text-gray-300';
      case 'legendary': return 'text-yellow-500';
      case 'fusion': return 'text-red-500';
      case 'ultra_fusion': return 'text-orange-500';
      case 'mythic': return 'text-purple-500';
      default: return 'text-gray-400';
    }
  };

  const getAlbumColor = (album?: string | null) => {
    switch (album) {
      case 'paleontology': return 'text-orange-700';
      case 'history': return 'text-yellow-500';
      case 'oceans_and_seas': return 'text-blue-500';
      case 'life_on_land': return 'text-green-500';
      case 'space': return 'text-purple-500';
      case 'arts_and_culture': return 'text-pink-500';
      case 'science': return 'text-cyan-500';
      default: return 'text-gray-400';
    }
  };

  const getTriggerColor = (trigger: string) => {
    switch (trigger) {
      case 'draw': return 'text-green-400';
      case 'play': return 'text-red-400';
      case 'return': return 'text-purple-400';
      case 'start': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">CUE Cards API</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Enter card name to query..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !cardName.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {loading ? 'Searching...' : 'Query Card'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-8 p-4 bg-red-900 border border-red-600 rounded-lg">
            <p className="text-red-200">Error: {error}</p>
          </div>
        )}

        {cardData && (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">{cardData.name.toUpperCase()}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Energy:</span>
                  <span className="text-blue-400">
                    {cardData.energy !== null && cardData.energy !== undefined ? cardData.energy : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Power:</span>
                  <span className="text-purple-400">
                    {cardData.power !== null && cardData.power !== undefined ? cardData.power : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Rarity:</span>
                  <span className={getRarityColor(cardData.rarity)}>
                    {cardData.rarity ? cardData.rarity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span className="text-cyan-400">
                    {cardData.type ? cardData.type.replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Album:</span>
                <span className={getAlbumColor(cardData.album)}>
                  {cardData.album ? cardData.album.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Collection:</span>
                <span className="text-cyan-400">
                  {cardData.collection || 'Unknown'}
                </span>
              </div>
            </div>

            {(cardData.ability_triggers.length > 0 || cardData.ability_descriptions.length > 0) && (
              <div>
                <h3 className="text-xl font-bold mb-4">Abilities</h3>
                <div className="space-y-3">
                  {Array.from({ length: Math.max(cardData.ability_triggers.length, cardData.ability_descriptions.length) }).map((_, i) => (
                    <div key={i} className="bg-gray-700 p-3 rounded">
                      {cardData.ability_triggers[i] && (
                        <div className="mb-2">
                          <span className={`${getTriggerColor(cardData.ability_triggers[i])} font-bold uppercase`}>
                            {cardData.ability_triggers[i]}:
                          </span>
                        </div>
                      )}
                      {cardData.ability_descriptions[i] && (
                        <p className="text-gray-200 ml-4">
                          {cardData.ability_descriptions[i]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
