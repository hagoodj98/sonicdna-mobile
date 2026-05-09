# SonicDNA Mobile App

SonicDNA is an Expo React Native app for recording, importing, and transforming audio using source profile matching.

## Requirements

- Node.js 20+
- npm 10+
- Xcode (for iOS simulator) and/or Android Studio (for Android emulator)
- Expo Go app (optional, for physical device testing)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start Expo:

```bash
npx expo start
```

3. For physical iOS devices on different networks, start with tunnel mode:

```bash
npx expo start --tunnel
```

## Common Commands

```bash
npm run lint
npm run test
npm run typecheck
npm run doctor
```

## App Structure

- `app/`: Expo Router routes and screens
- `components/`: UI and feature components
- `hooks/`: audio workflows and screen logic
- `styles/`: shared style sheets
- `config/`: API endpoint configuration
- `__tests__/`: unit and integration tests

## Branding

- App name: SonicDNA
- Expo slug: sonicdna

## Build and CI

- EAS profiles are defined in `eas.json`
- CI workflows are in `.github/workflows/`

Useful local build commands:

```bash
npm run eas:build:preview
npm run eas:build:production
```
