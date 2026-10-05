# Guidelines

## API

To make sure implementation of endpoints is right, you can check the API project at ```../api```.

## Design

You'll find the Figma design here: <https://www.figma.com/design/lfaQXGxdS90Qtk1RlPL4My/Zamana-%C2%B7-Design?node-id=0-1&t=EtoLF74eTtjj1efv-1>.

## Stack

- React Native with Expo, no web version
- API with Node.js (Express) on a remote server
- Zustand for local stores
- Zod for form schema validations
- Tanstack Query for caching, invalidation, refetch...
- TypeScript with tRPC for end-to-end type-safety
- SQLite (with the expo-sqlite package) as database, local and offline
- Unit testing with jest and the jest-expo package
- Styles with Tailwind v3 and Nativewind v4
- Icons with Ionicons and the react-native-vector-icons/iconicons package
- Bun as package manager and runtime, instead of npm, pnpm or yarn
- Biome as linter and formatter
- Android and iOS

## Rules

- Check @package.json to see available commands.
- Use Bun as package manager and runtime instead of npm, pnpm or Yarn.
- Use Tailwind/Nativewind with className for styles, with inline StyleSheet only if the rules doesn't exist.
- We use a feature-based MVVM architecture. You'll find the dedicated hooks, providers, tests, etc, of a specific feature in the /features folder. Common logic is found in the folders of the same names at the root of the project.
- We use a Test-Driven-Development (TDD) logic when implementing or updating a feature, so don't forget to write unit tests for the critical logic (hooks, providers, endpoints, etc) and check for any regression. Respect the feature-based architecture for the ``__tests__`` folder.
- As we use Typescript by default, run bun ts to check if everything if still ok after a code update.
- For spacing, margins, paddings, we are in base-8, so if you see minor inconsistencies on the Figma design (like 9px instead of 8px), round it to the nearast logical number.

## Expo

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

### Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch <https://docs.expo.dev/llms.txt> — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

### Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

### Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: <https://docs.expo.dev/router/introduction.md>

### Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: <https://docs.expo.dev/eas/index.md>

### Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: <https://docs.expo.dev/versions/latest/index.md>
