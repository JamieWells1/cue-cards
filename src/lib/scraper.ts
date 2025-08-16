import { CueCard, Rarity, CardType, Album, Trigger } from '@/types/cue-card';

const WORDS_TO_LOWERCASE = ['the', 'of', 'as', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'and', 'or', 'but', 'a', 'an'];

export function formatCardName(cardName: string): string {
  return cardName
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !WORDS_TO_LOWERCASE.includes(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word.toLowerCase();
    })
    .join('_')
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
    .replace(/&/g, '%26')
    .replace(/\?/g, '%3F')
    .replace(/#/g, '%23')
    .replace(/\+/g, '%2B')
    .replace(/=/g, '%3D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\[/g, '%5B')
    .replace(/\]/g, '%5D')
    .replace(/\{/g, '%7B')
    .replace(/\}/g, '%7D')
    .replace(/\|/g, '%7C')
    .replace(/\\/g, '%5C')
    .replace(/\^/g, '%5E')
    .replace(/~/g, '%7E')
    .replace(/`/g, '%60')
    .replace(/@/g, '%40')
    .replace(/!/g, '%21')
    .replace(/\$/g, '%24')
    .replace(/%/g, '%25')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/,/g, '%2C')
    .replace(/;/g, '%3B')
    .replace(/:/g, '%3A');
}

export async function fetchWikiPage(cardName: string): Promise<string> {
  const formattedName = formatCardName(cardName);
  const url = `https://cards-the-universe-and-everything.fandom.com/wiki/${formattedName}`;
  
  console.log(`🌐 Fetching wiki page: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`❌ Wiki fetch failed: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to fetch wiki page: ${response.status} ${response.statusText}`);
  }
  
  const html = await response.text();
  console.log(`✅ Wiki page fetched successfully (${html.length} characters)`);
  
  // Log preview of fetched HTML
  const preview = html.substring(0, 500).replace(/\s+/g, ' ');
  console.log(`📄 Page preview: ${preview}...`);
  
  return html;
}

export function extractAsideContent(html: string): { asideHtml: string; imageUrl: string | null } {
  console.log(`🔍 Searching for aside element in HTML (${html.length} chars)...`);
  const asideMatch = html.match(/<aside[^>]*>([\s\S]*?)<\/aside>/i);
  if (!asideMatch) {
    console.error(`❌ No aside element found on the page`);
    throw new Error('No aside element found on the page');
  }
  
  const asideHtml = asideMatch[1];
  console.log(`✅ Found aside element (${asideHtml.length} chars)`);
  
  // Log preview of aside content
  const asidePreview = asideHtml.substring(0, 300).replace(/\s+/g, ' ');
  console.log(`📋 Aside preview: ${asidePreview}...`);
  
  console.log(`🖼️ Looking for image in figure element...`);
  const figureMatch = asideHtml.match(/<figure[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*class="image[^"]*"[\s\S]*?<\/figure>/i);
  const imageUrl = figureMatch ? figureMatch[1] : null;
  
  if (imageUrl) {
    console.log(`✅ Found image URL: ${imageUrl}`);
  } else {
    console.log(`⚠️ No image found in aside content`);
  }
  
  return { asideHtml, imageUrl };
}

export async function extractCardDataWithAI(asideHtml: string, imageUrl: string | null, cardName: string): Promise<CueCard> {
  console.log(`🤖 Starting AI extraction for card: "${cardName}"`);
  console.log(`📝 HTML content length: ${asideHtml.length} characters`);
  if (imageUrl) {
    console.log(`🖼️ Image URL available: ${imageUrl}`);
  }
  
  const client = await import('openai').then(mod => new mod.default({
    apiKey: process.env.OPENAI_API_KEY,
  }));

  const prompt = `Extract card data from this HTML content from a CUE card wiki page. The card name is "${cardName}".

HTML content:
${asideHtml}

${imageUrl ? `Image URL: ${imageUrl}` : 'No image found'}

Please extract the following information and return as JSON:
- name: The card name
- energy: Energy cost (number or null)
- power: Power value (number or null) 
- rarity: One of: common, rare, epic, legendary, fusion, ultra_fusion, mythic (or null)
- type: Either "standard" or "limited" (or null)
- album: One of: paleontology, history, oceans_and_seas, life_on_land, space, arts_and_culture, science (or null)
- collection: Collection name (string or null)
- ability_triggers: Array of trigger types: "draw", "play", "return", "start"
- ability_descriptions: Array of ability description strings

Look for energy/power in stat boxes, rarity in card info, album/collection in categories, and abilities in description text.`;

  console.log(`🧠 Sending request to OpenAI (gpt-4o-mini)...`);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a data extraction assistant. Extract card information from HTML and return valid JSON only.",
      },
      { role: "user", content: prompt },
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
    console.error(`❌ No response content from OpenAI`);
    throw new Error("No response data returned from OpenAI");
  }

  console.log(`✅ OpenAI response received`);
  
  // Log preview of OpenAI response
  const responsePreview = response.choices[0].message.content.substring(0, 200).replace(/\s+/g, ' ');
  console.log(`🤖 AI response preview: ${responsePreview}...`);
  
  const rawCardData = JSON.parse(response.choices[0].message.content);
  console.log(`📋 Parsed card data:`, rawCardData);
  
  const cardData: CueCard = {
    name: rawCardData.name,
    energy: rawCardData.energy,
    power: rawCardData.power,
    rarity: rawCardData.rarity ? rawCardData.rarity as Rarity : null,
    type: rawCardData.type ? rawCardData.type as CardType : null,
    album: rawCardData.album ? rawCardData.album as Album : null,
    collection: rawCardData.collection,
    ability_triggers: rawCardData.ability_triggers ? rawCardData.ability_triggers.map((trigger: string) => trigger as Trigger) : [],
    ability_descriptions: rawCardData.ability_descriptions || [],
    imageUrl: imageUrl
  };
  
  console.log(`🎯 Final card data prepared for return`);
  return cardData;
}

export async function scrapeCardData(cardName: string): Promise<CueCard> {
  console.log(`🚀 Starting scraper for card: "${cardName}"`);
  const startTime = Date.now();
  
  try {
    const html = await fetchWikiPage(cardName);
    const { asideHtml, imageUrl } = extractAsideContent(html);
    const cardData = await extractCardDataWithAI(asideHtml, imageUrl, cardName);
    
    const totalTime = Date.now() - startTime;
    console.log(`🎉 Scraping completed successfully in ${totalTime}ms`);
    return cardData;
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`💥 Scraping failed after ${totalTime}ms:`, error instanceof Error ? error.message : error);
    throw new Error(`Failed to scrape card data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}