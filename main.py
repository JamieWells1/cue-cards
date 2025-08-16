from fastapi import FastAPI, HTTPException
from openai import OpenAI
from pydantic import BaseModel
from enum import Enum
from typing import Optional, List
import os
import json

# for the CLI
GREEN = "\033[92m"
RED = "\033[91m"
RESET = "\033[0m"

GREY = "\033[90m"  # common
BROWN = "\033[33m"  # rare
SILVER = "\033[37m"  # epic
GOLD = "\033[93m"  # legendary
RED_RARITY = "\033[91m"  # fusion
BRIGHT_ORANGE = "\033[38;5;208m"  # ultra_fusion
VIOLET = "\033[95m"  # mythic

PURPLE = "\033[95m"  # power
LIGHT_BLUE = "\033[94m"  # energy
MID_BLUE = "\033[36m"  # energy alternative

DARK_ORANGE = "\033[38;5;208m"  # paleontology
YELLOW = "\033[93m"  # history
BLUE = "\033[94m"  # oceans and seas
GREEN = "\033[92m"  # life on land
PURPLE_ALBUM = "\033[95m"  # space
PINKY_RED = "\033[38;5;197m"  # arts and culture
TURQUOISE = "\033[96m"  # science

LIME = "\033[92m"  # draw
LIGHT_RED = "\033[91m"  # play
PURPLE_TRIGGER = "\033[95m"  # return
YELLOW = "\033[93m"  # start

# Formatting
BOLD = "\033[1m"
UNDERLINE = "\033[4m"

GPT_MODEL = "gpt-5-mini"

app = FastAPI(title="Cue Cards API", version="1.0.0")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class Rarity(str, Enum):
    COMMON = "common"
    RARE = "rare"
    EPIC = "epic"
    LEGENDARY = "legendary"
    FUSION = "fusion"
    ULTRA_FUSION = "ultra_fusion"
    MYTHIC = "mythic"


class CardType(str, Enum):
    STANDARD = "standard"
    LIMITED = "limited"


class Trigger(str, Enum):
    DRAW = "draw"
    PLAY = "play"
    RETURN = "return"
    START = "start"


class Album(str, Enum):
    PALEONTOLOGY = "paleontology"
    HISTORY = "history"
    OCEANS_AND_SEAS = "oceans_and_seas"
    LIFE_ON_LAND = "life_on_land"
    SPACE = "space"
    ARTS_AND_CULTURE = "arts_and_culture"
    SCIENCE = "science"


class CueCard(BaseModel):
    name: str
    energy: Optional[int]
    power: Optional[int]
    rarity: Optional[Rarity]
    type: Optional[CardType]
    album: Optional[Album]
    collection: Optional[str]
    ability_triggers: List[Trigger]
    ability_descriptions: List[str]


def query(card: str) -> CueCard:
    try:
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")

        response = client.chat.completions.create(
            model="gpt-4o-search-preview-2025-03-11",
            messages=[
                {
                    "role": "system",
                    "content": "You are a careful data extraction assistant that fetches CUE (Cards, the Universe and "
                    "Everything) card data from https://cards-the-universe-and-everything.fandom.com/wiki/[card]. For a "
                    "given card name, retrieve the page (if it exists) and extract the card data. Return the data as valid JSON.",
                },
                {"role": "user", "content": card},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "cue_card",
                    "schema": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "energy": {"type": ["integer", "null"]},
                            "power": {"type": ["integer", "null"]},
                            "rarity": {
                                "type": ["string", "null"],
                                "enum": [
                                    "common",
                                    "rare",
                                    "epic",
                                    "legendary",
                                    "fusion",
                                    "ultra_fusion",
                                    "mythic",
                                    None,
                                ],
                            },
                            "type": {
                                "type": ["string", "null"],
                                "enum": ["standard", "limited", None],
                            },
                            "album": {
                                "type": ["string", "null"],
                                "enum": [
                                    "paleontology",
                                    "history",
                                    "oceans_and_seas",
                                    "life_on_land",
                                    "space",
                                    "arts_and_culture",
                                    "science",
                                    None,
                                ],
                            },
                            "collection": {"type": ["string", "null"]},
                            "ability_triggers": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "enum": ["draw", "play", "return", "start"],
                                },
                            },
                            "ability_descriptions": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                        },
                        "required": [
                            "name",
                            "ability_triggers",
                            "ability_descriptions",
                        ],
                        "additionalProperties": False,
                    },
                },
            },
        )

        if not response.choices[0].message.content:
            raise HTTPException(
                status_code=500, detail=f"No response data returned from OpenAI"
            )

        card_data = json.loads(response.choices[0].message.content)
        return CueCard(**card_data)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error communicating with OpenAI: {str(e)}"
        )


def get_rarity_color(rarity: Optional[Rarity]) -> str:
    if not rarity:
        return RESET
    rarity_colors = {
        Rarity.COMMON: GREY,
        Rarity.RARE: BROWN,
        Rarity.EPIC: SILVER,
        Rarity.LEGENDARY: GOLD,
        Rarity.FUSION: RED_RARITY,
        Rarity.ULTRA_FUSION: BRIGHT_ORANGE,
        Rarity.MYTHIC: VIOLET,
    }
    return rarity_colors.get(rarity, RESET)


def get_trigger_color(trigger: Trigger) -> str:
    trigger_colors = {
        Trigger.DRAW: LIME,
        Trigger.PLAY: LIGHT_RED,
        Trigger.RETURN: PURPLE_TRIGGER,
        Trigger.START: YELLOW,
    }
    return trigger_colors.get(trigger, RESET)


def get_album_color(album: Optional[Album]) -> str:
    if not album:
        return RESET
    album_colors = {
        Album.PALEONTOLOGY: DARK_ORANGE,
        Album.HISTORY: YELLOW,
        Album.OCEANS_AND_SEAS: BLUE,
        Album.LIFE_ON_LAND: GREEN,
        Album.SPACE: PURPLE_ALBUM,
        Album.ARTS_AND_CULTURE: PINKY_RED,
        Album.SCIENCE: TURQUOISE,
    }
    return album_colors.get(album, RESET)


def visual_length(text: str) -> int:
    """Calculate the visual length of text, excluding ANSI escape sequences"""
    import re
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    clean_text = ansi_escape.sub('', text)
    return len(clean_text)


def display(card: CueCard):
    rarity_color = get_rarity_color(card.rarity)
    album_color = get_album_color(card.album)

    print(f"\n{album_color}{'=' * 60}")
    print(f"{BOLD}{album_color}{card.name.upper()}{RESET}")
    print(f"{album_color}{'=' * 60}")

    print(f"\n{BOLD}CARD STATS{RESET}")
    print(f"┌{'─' * 58}┐")

    energy_display = (
        f"{LIGHT_BLUE}{card.energy}{RESET}"
        if card.energy is not None
        else f"{GREY}N/A{RESET}"
    )
    power_display = (
        f"{PURPLE}{card.power}{RESET}"
        if card.power is not None
        else f"{GREY}N/A{RESET}"
    )

    energy_line = f"{BOLD}Energy:{RESET} {energy_display}"
    power_line = f"{BOLD}Power:{RESET} {power_display}"
    energy_visual_len = visual_length(energy_line)
    power_visual_len = visual_length(power_line)
    energy_padding = 26 - energy_visual_len
    power_padding = 56 - energy_visual_len - energy_padding - power_visual_len
    print(f"│ {energy_line}{' ' * energy_padding}{power_line}{' ' * power_padding} │")

    rarity_display = (
        f"{rarity_color}{card.rarity.value.replace('_', ' ').title()}{RESET}"
        if card.rarity
        else f"{GREY}Unknown{RESET}"
    )
    type_display = (
        f"{MID_BLUE}{card.type.value.title()}{RESET}"
        if card.type
        else f"{GREY}Unknown{RESET}"
    )

    rarity_line = f"{BOLD}Rarity:{RESET} {rarity_display}"
    type_line = f"{BOLD}Type:{RESET} {type_display}"
    rarity_visual_len = visual_length(rarity_line)
    type_visual_len = visual_length(type_line)
    rarity_padding = 26 - rarity_visual_len
    type_padding = 56 - rarity_visual_len - rarity_padding - type_visual_len
    print(f"│ {rarity_line}{' ' * rarity_padding}{type_line}{' ' * type_padding} │")

    album_display = (
        f"{album_color}{card.album.value.replace('_', ' ').title()}{RESET}"
        if card.album
        else f"{GREY}Unknown{RESET}"
    )
    collection_display = (
        f"{MID_BLUE}{card.collection}{RESET}"
        if card.collection
        else f"{GREY}Unknown{RESET}"
    )

    album_line = f"{BOLD}Album:{RESET} {album_display}"
    collection_line = f"{BOLD}Collection:{RESET} {collection_display}"
    album_visual_len = visual_length(album_line)
    collection_visual_len = visual_length(collection_line)
    album_padding = 26 - album_visual_len
    collection_padding = 56 - album_visual_len - album_padding - collection_visual_len
    print(f"│ {album_line}{' ' * album_padding}{collection_line}{' ' * collection_padding} │")
    print(f"└{'─' * 58}┘")

    if card.ability_triggers or card.ability_descriptions:
        print(f"\n{BOLD}ABILITIES{RESET}")
        print(f"┌{'─' * 58}┐")

        max_items = max(len(card.ability_triggers), len(card.ability_descriptions))
        
        for i in range(max_items):
            trigger_text = ""
            if i < len(card.ability_triggers):
                trigger = card.ability_triggers[i]
                color = get_trigger_color(trigger)
                trigger_text = f"{color}{trigger.value.upper()}{RESET}"
            
            if i < len(card.ability_descriptions):
                description = card.ability_descriptions[i]
                
                if trigger_text:
                    available_width = 54 - len(trigger.value.upper()) - 3
                    trigger_line = f"{trigger_text}: "
                else:
                    available_width = 54
                    trigger_line = ""

                words = description.split()
                lines = []
                current_line = []
                current_length = 0

                for word in words:
                    if current_length + len(word) + 1 <= available_width:
                        current_line.append(word)
                        current_length += len(word) + 1
                    else:
                        if current_line:
                            lines.append(" ".join(current_line))
                        current_line = [word]
                        current_length = len(word)
                
                if current_line:
                    lines.append(" ".join(current_line))
                
                if lines:
                    first_line = trigger_line + lines[0]
                    first_line_visual_len = visual_length(first_line)
                    first_line_padding = 56 - first_line_visual_len
                    print(f"│ {first_line}{' ' * first_line_padding} │")
                    
                    for line in lines[1:]:
                        indent = len(trigger.value.upper()) + 3 if trigger_text else 0
                        padded_line = " " * indent + line
                        padded_line_visual_len = visual_length(padded_line)
                        line_padding = 56 - padded_line_visual_len
                        print(f"│ {padded_line}{' ' * line_padding} │")
                elif trigger_text:
                    trigger_line_visual_len = visual_length(trigger_line)
                    trigger_line_padding = 56 - trigger_line_visual_len
                    print(f"│ {trigger_line}{' ' * trigger_line_padding} │")
            elif trigger_text:
                trigger_text_visual_len = visual_length(trigger_text)
                trigger_text_padding = 56 - trigger_text_visual_len
                print(f"│ {trigger_text}{' ' * trigger_text_padding} │")
            
            if i < max_items - 1:
                print(f"│{' ' * 58}│")

        print(f"└{'─' * 58}┘")


@app.get("/")
async def root():
    return {"message": "Cue Cards API is running"}


@app.post("/card")
async def query_card(card: str) -> CueCard:
    return query(card)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


def run_server():
    import uvicorn
    import threading
    import time

    def start_server():
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="error")

    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    time.sleep(1)
    print(f"\n{GREEN}✓ Server running{RESET}")


if __name__ == "__main__":
    run_server()

    try:
        while True:
            card = input("\nEnter the card you'd like to query: ")
            try:
                result = query(card)
                display(result)
            except Exception as e:
                print(f"{RED}Error: {str(e)}{RESET}\n")
    except KeyboardInterrupt:
        print(f"\n{GREEN}Goodbye!{RESET}")
