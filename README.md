# SonicDNA Mobile App

SonicDNA is an Expo React Native app for recording, importing, and transforming audio using source profile matching.

## Requirements

- Node.js 20+
- npm 10+
- Expo Go app on your phone

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the Metro bundler for Expo Go:

```bash
npm run start:ios:go
or
npx expo start
```

3. Scan the QR code in Expo Go on your iPhone or Android device.

This workflow does not require paid Apple Developer enrollment.

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
- `config/`: API endpoint configuration
- `__tests__/`: unit and integration tests

## Branding

- App name: SonicDNA
- Expo slug: sound-dna-api

## Build and CI

- CI runs automatically on push/PR via `.github/workflows/ci.yml` (lint, tests, typecheck, doctor)
- EAS build workflow is manual-only via `.github/workflows/eas-build.yml`
- EAS profiles are defined in `eas.json`

### When To Use EAS Builds

- Use EAS builds only for release/demo artifacts
- Do not use EAS builds for routine code validation
- For normal development, use Expo Go + CI checks

Useful local build commands:

```bash
npm run start:ios:go
```

### Manual EAS Build

Run from GitHub Actions only when needed:

1. Open `Actions` in GitHub.
2. Select `EAS Build`.
3. Click `Run workflow` and choose profile/platform.
