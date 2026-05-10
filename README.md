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

- EAS profiles are defined in `eas.json`

Useful local build commands:

```bash
npm run start:ios:go
```
