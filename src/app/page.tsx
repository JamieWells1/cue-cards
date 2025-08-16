"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { CueCard as CueCardType } from "@/types/cue-card";
import { Container } from "@/components/ui/container";
import { SearchBox } from "@/components/ui/search-box";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { CueCard } from "@/components/cue-card";

export default function Home() {
  const [cardName, setCardName] = useState("");
  const [cardData, setCardData] = useState<CueCardType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) return;

    setLoading(true);
    setError(null);
    setCardData(null);

    try {
      console.log(`🔍 Starting card search for: "${cardName}"`);
      const startTime = Date.now();
      
      // Format the card name for URL
      const formattedName = cardName
        .split(' ')
        .map((word, index) => {
          const wordsToLowercase = ['the', 'of', 'as', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'and', 'or', 'but', 'a', 'an'];
          if (index === 0 || !wordsToLowercase.includes(word.toLowerCase())) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }
          return word.toLowerCase();
        })
        .join('_');
      
      console.log(`📝 Formatted card name: "${cardName}" → "${formattedName}"`);
      console.log(`🌐 Wiki URL: https://cards-the-universe-and-everything.fandom.com/wiki/${formattedName}`);
      console.log(`📡 Sending request to API...`);

      const response = await fetch("/api/card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ card: cardName }),
      });

      const responseTime = Date.now() - startTime;
      console.log(`⏱️ API response received in ${responseTime}ms`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ API Error (${response.status}):`, errorData.error);
        throw new Error(errorData.error || "Failed to fetch card data");
      }

      const data = await response.json();
      console.log(`✅ Card data received:`, data);
      console.log(`📊 Card stats: Energy=${data.energy}, Power=${data.power}, Rarity=${data.rarity}`);
      console.log(`🏷️ Album: ${data.album}, Type: ${data.type}`);
      console.log(`⚡ Abilities: ${data.ability_descriptions.length} ability(ies)`);
      console.log(`🎯 Total request time: ${Date.now() - startTime}ms`);
      
      setCardData(data);
    } catch (err) {
      console.error(`💥 Request failed:`, err instanceof Error ? err.message : err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCardName("");
    setCardData(null);
    setError(null);
  };

  const examples = ["Planet X", "Leonhard Euler", "Michelangelo"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600 to-purple-700">
        <Container className="py-8 sm:py-12 lg:py-16 space-y-6 sm:space-y-8">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
              <Heading
                level={1}
                className="text-white font-bold text-2xl sm:text-3xl lg:text-4xl"
              >
                CUE Cards Explorer
              </Heading>
            </div>
            <Text
              size="lg"
              className="max-w-2xl mx-auto text-blue-100 px-4 sm:px-0 leading-relaxed"
            >
              Discover detailed information about your favorite CUE (Cards, the
              Universe and Everything) cards. Search through the vast collection
              and explore card stats, abilities, and lore.
            </Text>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto px-4 sm:px-0"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <SearchBox
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  onClear={handleClear}
                  placeholder="Enter card name to search..."
                  disabled={loading}
                  className="h-11 sm:h-12 text-sm sm:text-base bg-white border-white/20 focus:border-yellow-400"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !cardName.trim()}
                size="lg"
                className="sm:w-auto w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-11 sm:h-12 text-sm sm:text-base shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search Card"
                )}
              </Button>
            </div>
          </form>

          {/* Example Cards */}
          <div className="text-center space-y-3 px-4 sm:px-0">
            <Text size="sm" className="text-blue-200">
              Try searching for these cards:
            </Text>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-lg mx-auto">
              {examples.map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCardName(example);
                    setError(null);
                  }}
                  disabled={loading}
                  className="text-xs sm:text-sm bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white px-3 sm:px-4 py-2"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Results Section */}
      <Container className="py-6 sm:py-8 lg:py-12">
        {error && (
          <Card className="mb-6 sm:mb-8 border-destructive/50 bg-destructive/10 animate-slide-up mx-4 sm:mx-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
                <Text
                  variant="destructive"
                  weight="medium"
                  className="text-sm sm:text-base"
                >
                  {error}
                </Text>
              </div>
            </CardContent>
          </Card>
        )}

        {cardData && (
          <div className="animate-slide-up space-y-4 sm:space-y-6 mx-4 sm:mx-0">
            <CueCard card={cardData} />

            {/* Disclaimer */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3 sm:mb-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  <Text
                    weight="semibold"
                    className="text-blue-900 text-sm sm:text-base"
                  >
                    Missing a card?
                  </Text>
                </div>
                <Text className="text-center text-gray-700 text-sm sm:text-base leading-relaxed px-2 sm:px-0">
                  Help expand the database by adding it to the{" "}
                  <a
                    href="https://cards-the-universe-and-everything.fandom.com/wiki/Card_Overview"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold hover:underline bg-blue-100 px-2 py-1 rounded-md transition-colors duration-200 hover:bg-blue-200 text-xs sm:text-sm"
                  >
                    CUE Cards Wiki
                  </a>{" "}
                  so it can be fetched in future searches.
                </Text>
                <div className="text-center mt-3">
                  <a
                    href="https://github.com/JamieWells1/cue-cards-api/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold hover:underline bg-red-100 px-2 py-1 rounded-md transition-colors duration-200 hover:bg-red-200 text-xs sm:text-sm"
                  >
                    Report a Bug
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!cardData && !error && !loading && (
          <div className="text-center py-12 sm:py-16 lg:py-20 space-y-4 sm:space-y-6 mx-4 sm:mx-0">
            <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 mx-auto rounded-full bg-slate-200 flex items-center justify-center">
              <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-slate-500" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <Heading
                level={3}
                className="text-slate-700 font-semibold text-lg sm:text-xl"
              >
                Start your card exploration
              </Heading>
              <Text className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Enter a card name above to discover its secrets and abilities
              </Text>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
