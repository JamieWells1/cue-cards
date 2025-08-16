import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { CueCard as CueCardType, Rarity, Album, Trigger, CardType } from "@/types/cue-card";
import { Zap, Battery } from "lucide-react";

interface CueCardProps {
  card: CueCardType;
  className?: string;
}

export function CueCard({ card, className }: CueCardProps) {
  const getRarityColor = (rarity?: Rarity | null) => {
    if (!rarity) return "text-gray-500";
    
    const colors = {
      common: "text-gray-500",
      rare: "text-amber-600", // bronze
      epic: "text-gray-400", // silver
      legendary: "text-yellow-500", // gold
      fusion: "text-red-500",
      ultra_fusion: "text-orange-300", // light orange
      mythic: "text-purple-500",
    };
    
    return colors[rarity] || "text-gray-500";
  };

  const getAlbumColor = (album?: Album | null) => {
    if (!album) return "text-gray-500";
    
    const colors = {
      paleontology: "text-red-600", // orangey red
      history: "text-yellow-500",
      oceans_and_seas: "text-blue-500",
      life_on_land: "text-green-500",
      space: "text-purple-500",
      arts_and_culture: "text-pink-600", // #CC397B
      science: "text-cyan-500", // turquoise
    };
    
    return colors[album] || "text-gray-500";
  };

  const getTriggerGradient = (trigger: Trigger) => {
    const gradients = {
      draw: "bg-gradient-to-br from-lime-400 to-lime-600 shadow-lime-200",
      play: "bg-gradient-to-br from-orange-500 to-orange-700 shadow-orange-200",
      return: "bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-200",
      start: "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-200",
    };
    
    return gradients[trigger] || "bg-gradient-to-br from-gray-400 to-gray-600 shadow-gray-200";
  };

  const getTypeColor = (type?: CardType | null) => {
    if (!type) return "text-gray-500";
    
    const colors = {
      standard: "text-gray-900",
      limited: "text-blue-600", // darker blue
    };
    
    return colors[type] || "text-gray-500";
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto animate-fade-in bg-white shadow-lg", className)}>
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
        <CardTitle className="text-center text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide text-gray-900 break-words">
          {card.name.toUpperCase()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
              <Text variant="muted" weight="bold" className="text-sm sm:text-lg">Energy:</Text>
              <div className="flex items-center gap-1 sm:gap-2">
                <Battery className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500" />
                <Text className="text-blue-500 font-black text-lg sm:text-2xl">
                  {card.energy !== null ? card.energy : 'N/A'}
                </Text>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
              <Text variant="muted" weight="bold" className="text-sm sm:text-lg">Power:</Text>
              <div className="flex items-center gap-1 sm:gap-2">
                <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-purple-500" />
                <Text className="text-purple-500 font-black text-lg sm:text-2xl">
                  {card.power !== null ? card.power : 'N/A'}
                </Text>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
              <Text variant="muted" weight="bold" className="text-sm sm:text-lg">Rarity:</Text>
              <Text className={cn(getRarityColor(card.rarity), "font-black text-base sm:text-xl")}>
                {card.rarity ? formatText(card.rarity) : 'Unknown'}
              </Text>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
              <Text variant="muted" weight="bold" className="text-sm sm:text-lg">Type:</Text>
              <Text className={cn(getTypeColor(card.type), "font-black text-base sm:text-xl")}>
                {card.type ? formatText(card.type) : 'Unknown'}
              </Text>
            </div>
          </div>
        </div>

        {/* Album & Collection */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
            <Text variant="muted" weight="bold" className="text-sm sm:text-lg">Album:</Text>
            <Text className={cn(getAlbumColor(card.album), "font-black text-base sm:text-xl")}>
              {card.album ? formatText(card.album) : 'Unknown'}
            </Text>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
            <Text variant="muted" weight="bold" className="text-sm sm:text-lg">Collection:</Text>
            <Text className="text-gray-700 font-black text-base sm:text-xl">
              {card.collection ? formatText(card.collection) : 'Unknown'}
            </Text>
          </div>
        </div>

        {/* Abilities */}
        {(card.ability_triggers.length > 0 || card.ability_descriptions.length > 0) && (
          <div className="space-y-3 sm:space-y-4">
            <Text size="lg" weight="bold" className="border-b-2 border-gray-200 pb-2 text-gray-900 text-lg sm:text-xl font-black">
              Abilities
            </Text>
            <div className="space-y-3">
              {Array.from({ 
                length: Math.max(card.ability_triggers.length, card.ability_descriptions.length) 
              }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {card.ability_triggers[i] && (
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        getTriggerGradient(card.ability_triggers[i]),
                        "font-black uppercase text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full text-white shadow-lg border border-white/20 relative overflow-hidden"
                      )}>
                        <span className="relative z-10">{card.ability_triggers[i]}</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20 pointer-events-none"></div>
                      </span>
                    </div>
                  )}
                  {card.ability_descriptions[i] && (
                    <Text variant="default" leading="relaxed" className="text-sm sm:text-base text-gray-700 font-bold">
                      {card.ability_descriptions[i]}
                    </Text>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}