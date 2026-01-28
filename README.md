# Solana ETF TCG Forge

AI-powered Trading Card Game (TCG) card generator built with React 19 + Vite + TypeScript. Enter a text prompt, Google Gemini generates card metadata and illustration, then mint the card via a real Solana devnet transaction with shareable Blink URLs.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v3
- **AI:** Google Gemini API (`@google/genai`) — text metadata + image generation
- **Blockchain:** Solana devnet via `@solana/web3.js` + Wallet Adapter (Phantom)
- **Build:** Vite 6, PostCSS, Autoprefixer
- **Test/Lint:** Vitest, Testing Library, ESLint + typescript-eslint

## Local Setup

**Prerequisites:** Node.js >= 20

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` and add your Gemini API key:

   ```
   GEMINI_API_KEY=your_key_here
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:3011`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run lint` | Run ESLint |

## Project Structure

```
├── index.html                 # Entry HTML
├── index.tsx                  # React entry + Buffer polyfill + Wallet provider
├── index.css                  # Tailwind directives + custom styles
├── App.tsx                    # Main app — generation flow + mint flow
├── constants.ts               # Gemini system prompt (TCG card director)
├── types.ts                   # TypeScript interfaces
├── components/
│   ├── CardDisplay.tsx        # TCG card render with holographic foil effect
│   ├── SolanaWallet.tsx       # Real Phantom wallet connect/disconnect
│   └── BlinkPreview.tsx       # Shareable Blink URL + Solana Explorer link
├── providers/
│   └── WalletProvider.tsx     # Solana wallet adapter context (devnet)
├── services/
│   ├── geminiService.ts       # Gemini API calls (metadata + image)
│   └── solanaService.ts       # Devnet tx: airdrop + self-transfer mint
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
└── eslint.config.js
```

## Usage Flow

1. Connect Phantom wallet (Solana devnet)
2. Enter a card theme/concept in the input field
3. Gemini generates card metadata and illustration
4. Click "Mint Card Token" — Phantom signs a real devnet transaction
5. View tx on Solana Explorer, create a shareable Blink URL
