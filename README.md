# Fitssort Membership — Mobile App

React Native (bare CLI) member app for the Fitssort / FitHive gym management SaaS platform.

Members can sign in against a tenant, view membership status, browse classes, track progress, leave reviews, and complete SSLCommerz payments inside an in-app WebView.

---

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech stack](#tech-stack)
4. [Architecture](#architecture)
5. [Requirements](#requirements)
6. [Environment variables](#environment-variables)
7. [Folder structure](#folder-structure)
8. [Run locally](#run-locally)
9. [Build debug APK with Docker](#build-debug-apk-with-docker)
10. [Testing & quality](#testing--quality)
11. [Integrations](#integrations)
12. [Troubleshooting](#troubleshooting)
13. [Related packages](#related-packages)

---

## Overview

| Item | Detail |
|------|--------|
| Package | `GymMembershipMobileApp` |
| Display name | Fitssort Membership |
| Role | Member-facing mobile client |
| Framework | React Native **0.85** (bare — not Expo) |
| Package manager | **npm** (`package-lock.json`) |
| Auth | JWT (AsyncStorage + Bearer refresh) |
| Default API | `http://localhost:8021/api/v1` |

Tenant resolution for hostless mobile clients uses stored subdomain / schema headers (`X-Tenant-Subdomain`) with the backend’s mobile-aware tenant middleware.

---

## Features

| Area | Screens / capabilities |
|------|-------------------------|
| Auth | Splash, login, register |
| Dashboard | Membership overview / home tab |
| Classes | Browse and class-related member flows |
| Progress | Member progress tab |
| Reviews | Reviews tab |
| Subscription | Plan / subscription status |
| Payments | SSLCommerz checkout via `PaymentWebView` |
| Invoices | Invoice viewing via `InvoiceWebView` |
| Branches | Public branches + shift requests (service layer) |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js ≥ 22.11 |
| UI | React 19.2, React Native 0.85 |
| Navigation | React Navigation 7 (native-stack + bottom-tabs) |
| Styling | NativeWind 4 + Tailwind 3 |
| Storage | `@react-native-async-storage/async-storage` |
| Config | `react-native-config` |
| Payments UI | `react-native-webview` |
| Animation | Reanimated 4 |
| Tests | Jest + React Native Testing Library patterns |

---

## Architecture

```text
App.tsx
  └─ AuthProvider
       └─ NavigationContainer
            ├─ Auth stack (Splash / Login / Register)
            └─ Tab navigator (Dashboard, Classes, Progress, Reviews, Subscription)
                 └─ Modal stacks (PaymentWebView, InvoiceWebView)
```

```text
Screen → services/* → API client (Bearer JWT + X-Tenant-Subdomain)
                              │
                              ▼
                     Backend :8021 /api/v1
```

- Tokens and tenant hints live in AsyncStorage (`src/lib/storage.ts`)
- Refresh handled in `src/lib/tokenRefresh.ts`
- No TanStack Query — service functions + React context

---

## Requirements

Follow the official [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for your OS.

- Node.js ≥ 22.11
- npm
- Android Studio / SDK (Android) and/or Xcode + CocoaPods (iOS)
- Running backend API (default `http://localhost:8021`)

---

## Environment variables

This app uses `react-native-config`:

| Build type | File |
|------------|------|
| Debug | `.env` |
| Release | `.env.production` |
| Docker local APK | `.env.local` (compose `env_file`) |

| Variable | Purpose | Example |
|----------|---------|---------|
| `API_BASE_URL` | Backend API base | `http://localhost:8021/api/v1` |

If unset, the JS layer falls back to `http://localhost:8021/api/v1` ([`src/config/env.ts`](src/config/env.ts)).

On a physical Android device talking to a host machine backend, use `adb reverse` (see below) or set `API_BASE_URL` to your LAN IP / tunnel.

---

## Folder structure

```text
GymMembershipMobileApp/
├── android/
├── ios/
├── src/
│   ├── components/
│   ├── config/
│   ├── context/
│   ├── lib/
│   ├── navigation/
│   ├── screens/
│   │   ├── auth/
│   │   └── member/
│   ├── services/
│   └── theme/
├── __tests__/
├── scripts/
├── App.tsx
├── package.json
├── docker-compose.local.yml
└── Dockerfile.local
```

---

## Run locally

### 1. Install dependencies

```bash
npm install
```

Create a debug env file:

```bash
echo 'API_BASE_URL=http://localhost:8021/api/v1' > .env
```

### 2. Start Metro

```bash
npm start
```

### 3. Run on a device / emulator

**Android**

```bash
npm run android
```

If the emulator or device must reach the host backend on port 8021:

```bash
adb reverse tcp:8021 tcp:8021
```

**iOS** (macOS)

```bash
bundle install
bundle exec pod install
npm run ios
```

Fast Refresh applies edits automatically. Force reload from the Dev Menu if needed (`Ctrl`/`Cmd` + `M` on Android; `R` in iOS Simulator).

---

## Build debug APK with Docker

Produces `./output/fitssort-membership-debug.apk` without a full local Android SDK setup.

```bash
# ensure .env.local contains API_BASE_URL
docker compose -f docker-compose.local.yml build
docker compose -f docker-compose.local.yml up
```

Install on a connected device:

```bash
adb install -r output/fitssort-membership-debug.apk
adb reverse tcp:8021 tcp:8021
```

---

## Testing & quality

```bash
npm test
npm run lint
```

Tests live under `__tests__/`. Prefer user-interaction and auth/API behavior tests over implementation details.

---

## Integrations

| Integration | Detail |
|-------------|--------|
| Backend API | JWT + tenant headers against `/api/v1` |
| SSLCommerz | Checkout / renew via `PaymentWebViewScreen` (`gateway_slug: sslcommerz`) |
| Invoices | `InvoiceWebViewScreen` |

ZKTeco biometric hardware is handled on the backend / device side — not inside this app.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Metro / env setup | [RN troubleshooting](https://reactnative.dev/docs/troubleshooting) |
| API unreachable on Android | `adb reverse tcp:8021 tcp:8021` or set LAN `API_BASE_URL` |
| Stale native config | Rebuild after changing `.env` (react-native-config is build-time) |
| iOS pods | Re-run `bundle exec pod install` after native dependency changes |

---

## Related packages

| Package | Role |
|---------|------|
| [`gym_app_new_backend`](../gym_app_new_backend/) | Django REST API |
| [`gym_app_new_frontend`](../gym_app_new_frontend/) | Admin / platform web app |
| [`traefik`](../traefik/) | Reverse proxy / TLS |

---

## Learn more

- [React Native docs](https://reactnative.dev/docs/getting-started)
- [Environment setup](https://reactnative.dev/docs/set-up-your-environment)
- [React Navigation](https://reactnavigation.org/)
