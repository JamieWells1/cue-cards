# CUE Cards API

A Next.js application with TypeScript that provides an API for querying CUE (Cards, the Universe and Everything) card data, with a lightweight React frontend for testing.

## Features

- **TypeScript API Routes**: REST API endpoints for card data queries
- **React Frontend**: Simple interface to test API functionality  
- **OpenAI Integration**: Uses GPT models to extract card data from wiki pages
- **Tailwind CSS**: Modern styling with color-coded card attributes

## API Endpoints

- `GET /api` - API status
- `GET /api/health` - Health check
- `POST /api/card` - Query card data by name

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Add your OpenAI API key to .env.local
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

Enter a card name in the search input to query the CUE Cards wiki and display formatted card information including:

- Energy and Power stats
- Rarity (with color coding)
- Card type and album
- Ability triggers and descriptions

## Migration Notes

This project was migrated from a Python FastAPI application to Next.js with TypeScript, maintaining the same API functionality and adding a web interface for easier testing.
