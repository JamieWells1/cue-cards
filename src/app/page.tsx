'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { CueCard as CueCardType } from '@/types/cue-card';
import { Container } from '@/components/ui/container';
import { SearchBox } from '@/components/ui/search-box';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { CueCard } from '@/components/cue-card';

export default function Home() {
  const [cardName, setCardName] = useState('');
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

  const handleClear = () => {
    setCardName('');
    setCardData(null);
    setError(null);
  };

  const examples = ['Michelangelo', 'Loch Ness Monster', 'Albert Einstein', 'Tyrannosaurus Rex'];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-muted/30 to-background">
        <Container className="py-16 space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <Heading level={1} className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                CUE Cards Explorer
              </Heading>
            </div>
            <Text size="lg" variant="muted" className="max-w-2xl mx-auto">
              Discover detailed information about your favorite CUE (Cards, the Universe and Everything) cards. 
              Search through the vast collection and explore card stats, abilities, and lore.
            </Text>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchBox
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  onClear={handleClear}
                  placeholder="Enter card name to search..."
                  disabled={loading}
                  className="h-12 text-base"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !cardName.trim()}
                size="lg"
                className="sm:w-auto w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search Card'
                )}
              </Button>
            </div>
          </form>

          {/* Example Cards */}
          <div className="text-center space-y-3">
            <Text variant="muted" size="sm">
              Try searching for these popular cards:
            </Text>
            <div className="flex flex-wrap justify-center gap-2">
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
                  className="text-xs"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Results Section */}
      <Container className="py-8">
        {error && (
          <Card className="mb-8 border-destructive/50 bg-destructive/10 animate-slide-up">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <Text variant="destructive" weight="medium">
                  {error}
                </Text>
              </div>
            </CardContent>
          </Card>
        )}

        {cardData && (
          <div className="animate-slide-up">
            <CueCard card={cardData} />
          </div>
        )}

        {!cardData && !error && !loading && (
          <div className="text-center py-16 space-y-4">
            <div className="h-24 w-24 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Heading level={3} variant="muted" weight="semibold">
                Start your card exploration
              </Heading>
              <Text variant="muted">
                Enter a card name above to discover its secrets and abilities
              </Text>
            </div>
          </div>
        )}
      </Container>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <Container className="py-8">
          <div className="text-center space-y-2">
            <Text variant="muted" size="sm">
              Powered by OpenAI's search capabilities and the CUE Cards Wiki
            </Text>
            <Text variant="muted" size="xs">
              Data sourced from cards-the-universe-and-everything.fandom.com
            </Text>
          </div>
        </Container>
      </footer>
    </div>
  );
}
