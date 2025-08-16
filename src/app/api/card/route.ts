import { NextRequest, NextResponse } from 'next/server';
import { scrapeCardData } from '@/lib/scraper';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { card } = body;

    if (!card || typeof card !== 'string') {
      return NextResponse.json(
        { error: "Card name is required and must be a string" },
        { status: 400 }
      );
    }

    const cardData = await scrapeCardData(card);
    return NextResponse.json(cardData);

  } catch (error) {
    console.error('Error scraping card data:', error);
    return NextResponse.json(
      { error: `Error scraping card data: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
