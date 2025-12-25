# SCHEMA - AI-Powered Idea Generation Tool

## Overview

SCHEMA is an AI-powered idea generation tool designed for creators. It uses Google's Gemini AI to analyze user inputs (either specific work titles or abstract concepts) and generates diverse, cross-media recommendations that share thematic DNA with the input. The application emphasizes discovering unexpected connections across different media types (movies, books, art, music, history, etc.) while explicitly avoiding obvious sequels, remakes, or same-genre suggestions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router architecture
- **Language**: TypeScript (with relaxed strict mode for flexibility)
- **Styling**: Tailwind CSS v4 with PostCSS integration
- **Font**: JetBrains Mono for a technical/creative aesthetic
- **Theme**: Dark mode by default (#0a0a0a background)
- **UI Components**: Custom components using Lucide React for icons

### Backend Architecture
- **Server Actions**: Uses Next.js Server Actions (`"use server"`) for API logic
- **AI Integration**: Google Generative AI (Gemini) for content generation
- **Image Fetching**: Google Books API for retrieving book cover images
- **Web Scraping**: Cheerio library available for HTML parsing needs

### State Management
- React useState hooks for local component state
- No external state management library (keeping it simple)

### Key Design Patterns
1. **Dual Input Modes**: The AI distinguishes between specific titles (Case A) and abstract concepts (Case B), applying different recommendation strategies for each
2. **Negative Prompting**: Explicitly excludes sequels, prequels, spin-offs, and same-genre works to encourage creative discovery
3. **Cross-Media Discovery**: Always recommends across diverse media types rather than staying within one category

### Build Configuration
- TypeScript build errors are ignored (`ignoreBuildErrors: true`)
- ESLint errors are ignored during builds (`ignoreDuringBuilds: true`)
- Development server runs on port 5000

## External Dependencies

### AI Services
- **Google Generative AI (Gemini)**: Primary AI engine for generating recommendations
  - Requires `GOOGLE_API_KEY` environment variable
  - Uses `@google/generative-ai` package

### External APIs
- **Google Books API**: Fetches book cover thumbnails for visual display
  - No API key required for basic queries
  - Endpoint: `https://www.googleapis.com/books/v1/volumes`

### Key NPM Packages
- `next` (v15.2.3) - React framework
- `react` / `react-dom` (v19) - UI library
- `@google/generative-ai` - Gemini AI SDK
- `cheerio` - HTML parsing/scraping
- `lucide-react` - Icon library
- `tailwindcss` (v4) - Utility CSS framework

### Environment Variables Required
- `GOOGLE_API_KEY` - Google AI API key for Gemini access