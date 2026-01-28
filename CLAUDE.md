# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Solana ETF TCG Forge — an AI-powered Trading Card Game (TCG) card generator built with React 19 + Vite + TypeScript. Users enter a text prompt, Google Gemini generates card metadata and a card illustration, and the result can be "minted" via a simulated Solana blockchain flow with shareable Blink URLs.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (port 3000, host 0.0.0.0)
npm run build      # Production build
npm run preview    # Preview production build
```

No test runner or linter is configured.

## Environment

Requires a `GEMINI_API_KEY` in `.env.local` for the Google Gemini API.

## Architecture

**Entry:** `index.html` → `index.tsx` → `App.tsx`

**Key modules:**

- `services/geminiService.ts` — Two Gemini calls: `generateCardMetadata()` (text, returns structured JSON via schema) and `generateCardImage()` (image generation, returns base64 PNG). Uses `@google/genai` SDK.
- `constants.ts` — Chinese-language system prompt that instructs Gemini to act as a "cross-media IP style director + TCG prompt writer." Defines 10 mandatory variables and a card prompt template.
- `types.ts` — Core interfaces: `CardData`, `CardStats`, `GenerationStatus`, `CardVarList`.

**Components:**

- `App.tsx` — Orchestrates generation flow (idle → analyzing → painting → complete/error), manages all state.
- `components/CardDisplay.tsx` — Renders the TCG card with rarity-based gradients and holographic foil CSS animation.
- `components/SolanaWallet.tsx` — Mock Phantom wallet connection (simulated, no real blockchain calls).
- `components/BlinkPreview.tsx` — Generates and previews a shareable Blink URL.

**Styling:** Tailwind CSS via CDN (loaded in `index.html`), custom fonts (Cinzel, Orbitron, Inter), dark theme (#0a0a14), holographic `shine` keyframe animation.

**Path alias:** `@/*` maps to project root (configured in `tsconfig.json` and `vite.config.ts`).
