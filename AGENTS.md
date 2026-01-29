# Repository Guidelines

## Project Structure & Module Organization
- `index.html`, `index.tsx`, `App.tsx` are the entry points for the React + Vite app.
- `components/` holds UI building blocks (card display, wallet, Blink preview).
- `services/` contains API and blockchain logic (`geminiService`, `solanaService`).
- `providers/` wraps app-wide context (Solana wallet adapter).
- `server/` includes the Vite API plugin and server-side helpers for Solana actions.
- `test/` contains test setup; test files live alongside modules (e.g., `components/*.test.tsx`).
- `dist/` is the production build output (generated).
- Path alias: `@/` maps to the project root (see `tsconfig.json`, `vite.config.ts`).

## Build, Test, and Development Commands
- `npm run dev` — start the Vite dev server (defaults to port 3011).
- `npm run build` — create a production build in `dist/`.
- `npm run preview` — serve the production build locally.
- `npm run test` — run Vitest in watch mode.
- `npm run test:run` — run Vitest once in CI-friendly mode.
- `npm run lint` — run ESLint across the repo.

## Coding Style & Naming Conventions
- TypeScript + React (JSX) with ESM modules.
- Follow existing formatting in files you touch; no Prettier config is present.
- ESLint uses `@eslint/js` and `typescript-eslint` recommended rules.
- Test files use `*.test.ts` or `*.test.tsx` naming, colocated with the module.

## Testing Guidelines
- Test runner: Vitest with JSDOM and Testing Library (`test/setup.ts` loads jest-dom).
- Keep tests small and component-focused; prefer rendering-based tests for UI.
- Run `npm run test` while developing and `npm run test:run` before PRs.

## Commit & Pull Request Guidelines
- Commit history mixes Conventional Commits (e.g., `feat:`) and short imperative messages. Prefer a concise, imperative summary; use `feat:`/`fix:` when it adds clarity.
- PRs should include a brief description, test status, and screenshots for UI changes.
- If you add new env vars or config, update README and keep secrets in `.env.local`.

## Configuration & Secrets
- Required local config lives in `.env.local` (Gemini API key, Pinata, treasury keys).
- Never commit secrets; use placeholder values in docs and examples.
