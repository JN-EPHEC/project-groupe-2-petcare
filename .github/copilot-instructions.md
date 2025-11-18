## Quick repo snapshot

- Tech: Expo + React Native + TypeScript (Expo Router file-based routing). See `package.json` scripts.
- Entry: `app/` (file-based routes). Root layout: `app/_layout.tsx` uses `expo-router` Stack and a modal route.
- Theme: custom theme helpers in `constants/theme.ts` and `hooks/use-theme-color.ts`. Reusable UI: `components/themed-text.tsx` and `components/themed-view.tsx`.
- Assets: images live under `assets/images/` and are referenced via require(...) in components (e.g. `app/app/cookies.tsx`).
- Path alias: `@/*` maps to project root (see `tsconfig.json`). Many imports use `@/hooks/...` or `@/components/...`.

## What to know before editing

- Routing: Routes are created by placing files in `app/`. Route groups use parentheses (example: `(tabs)` folder is mounted in `app/_layout.tsx`). Modal screens are declared via `Stack.Screen` (see `app/_layout.tsx`).
- Theme & colors: Use `useThemeColor` (in `hooks/use-theme-color.ts`) and the `Colors` object in `constants/theme.ts`. Prefer `ThemedText`/`ThemedView` for consistent color resolution.
- Imports: Use the `@/` alias for repo-root imports. Avoid relative imports that traverse many levels when `@/` is clearer.
- Assets: Static images live at `/assets/images`. Many files use require(...) with paths relative to the file — verify relative paths when adding/moving files.
- Platform files: platform-specific components exist (example: `components/ui/icon-symbol.ios.tsx`), follow that naming convention when needed.

## Developer workflows & commands

- Install dependencies: `npm install`.
- Start dev server (Expo): `npm start` (calls `expo start`). You can also run `npm run android`, `npm run ios`, or `npm run web` (these call `expo start --android|--ios|--web`).
- Reset starter content: `npm run reset-project` (moves starter to `app-example` and creates blank `app`).
- Lint: `npm run lint` (runs `expo lint`).

## Conventions and patterns observed

- Functional React components with React Native `StyleSheet` styles. See `app/app/cookies.tsx` for a simple pattern (layout, styles object at bottom).
- Theming: components call `useThemeColor({ light, dark }, 'text'|'background')`. When adding UI, prefer `ThemedText`/`ThemedView` wrappers so color selection follows existing patterns.
- File-based routing: route filenames and directories correspond to URLs/screens. Route group anchors are used (see `unstable_settings.anchor` in `app/_layout.tsx`).
- Reanimated: `react-native-reanimated` is imported for side-effects in `app/_layout.tsx` (`import 'react-native-reanimated';`) — keep this import at top-level before animated usage.
- TypeScript: `strict: true` in `tsconfig.json`. Keep types precise and import types from React/React Native where helpful.

## Typical changes and where to make them

- Add a new screen: create a new file under `app/` (e.g. `app/new-screen.tsx`). Use `ThemedText` / `ThemedView` and export a default functional component.
- Add a reusable component: put it in `components/`, prefer named exports for small utilities and default export for a main component file.
- Add images: place under `assets/images/` and reference with `require(...)`. Verify relative path from the file that calls `require`.

## Examples from the codebase

- Theme helper: `hooks/use-theme-color.ts` + `constants/theme.ts` — use `useThemeColor({ light, dark }, 'text')` to resolve a color.
- Reused UI: `components/themed-text.tsx` shows multiple `type` variants (`title`, `subtitle`, `link`) — follow this when creating typographic variants.
- Routing: `app/_layout.tsx` mounts the `(tabs)` group and registers `modal` as a modal screen. New modal screens should be referenced in the Stack similarly.

## Quick tips for the AI agent

- When editing, prefer using `@/` imports (tsconfig path) — this improves readability and avoids brittle relative paths.
- Check `tsconfig.json` for path aliases, and `package.json` for the developer commands.
- Keep TypeScript `strict` rules in mind; add small type definitions for new props and prefer explicit return types for exported functions.
- For assets, confirm the correct relative path from the file that calls `require`. If unsure, open the file in the dev server and watch the Metro bundler errors.

---

If any section is unclear or you'd like this to include more examples (e.g., a short checklist to add a new screen or a template file), tell me which part and I will iterate.
