import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CueCard, Rarity, CardType, Album, Trigger } from '@/types/cue-card';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini-search-preview",
      messages: [
        {
          role: "system",
          content: "You are a careful data extraction assistant that fetches CUE (Cards, the Universe and Everything) card data from https://cards-the-universe-and-everything.fandom.com/wiki/[card] or similar. For a given card name, retrieve the page (if it exists) and extract the card data. Return the data as valid JSON. Make sure you do a comprehensive search for the page, and return null if nothing is found after retries.",
        },
        { role: "user", content: card },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "cue_card",
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              energy: { type: ["integer", "null"] },
              power: { type: ["integer", "null"] },
              rarity: {
                type: ["string", "null"],
                enum: [
                  "common",
                  "rare",
                  "epic",
                  "legendary",
                  "fusion",
                  "ultra_fusion",
                  "mythic",
                  null,
                ],
              },
              type: {
                type: ["string", "null"],
                enum: ["standard", "limited", null],
              },
              album: {
                type: ["string", "null"],
                enum: [
                  "paleontology",
                  "history",
                  "oceans_and_seas",
                  "life_on_land",
                  "space",
                  "arts_and_culture",
                  "science",
                  null,
                ],
              },
              collection: { type: ["string", "null"] },
              ability_triggers: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["draw", "play", "return", "start"],
                },
              },
              ability_descriptions: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["name", "ability_triggers", "ability_descriptions"],
            additionalProperties: false,
          },
        },
      },
    });

    if (!response.choices[0]?.message?.content) {
      return NextResponse.json(
        { error: "No response data returned from OpenAI" },
        { status: 500 }
      );
    }

    const rawCardData = JSON.parse(response.choices[0].message.content);
    
    // Convert string values to proper enum types
    const cardData: CueCard = {
      name: rawCardData.name,
      energy: rawCardData.energy,
      power: rawCardData.power,
      rarity: rawCardData.rarity ? rawCardData.rarity as Rarity : null,
      type: rawCardData.type ? rawCardData.type as CardType : null,
      album: rawCardData.album ? rawCardData.album as Album : null,
      collection: rawCardData.collection,
      ability_triggers: rawCardData.ability_triggers ? rawCardData.ability_triggers.map((trigger: string) => trigger as Trigger) : [],
      ability_descriptions: rawCardData.ability_descriptions || []
    };
    
    return NextResponse.json(cardData);

  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    return NextResponse.json(
      { error: `Error communicating with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
