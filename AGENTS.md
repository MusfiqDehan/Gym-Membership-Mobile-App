# AGENTS.md

## Cursor Cloud specific instructions

Bare React Native 0.85 (TypeScript) member-facing mobile app for the Fitssort
gym SaaS. It calls the Django backend (`API_BASE_URL`, default
`http://localhost:8021/api/v1`) via `react-native-config`.

### Dependency install caveat

`npm install` fails with a peer-dependency conflict (`prettier@2.8.8` is pinned
while `prettier-plugin-tailwindcss` wants `prettier@^3`). Install with
`npm install --legacy-peer-deps` (the environment/update script already does this).

### What can and cannot run in the cloud VM

- JS toolchain works: `npm test` (Jest) and `npx eslint .` run here.
  - Jest gotcha: the default `__tests__/App.test.tsx` imports `App.tsx`, which
    imports NativeWind's `./global.css`; the RN Jest preset has no CSS transform,
    so that suite errors on the CSS import. This is a pre-existing repo config
    gap, not an environment problem.
- Full app E2E is NOT possible here: it requires an Android emulator / Android
  SDK (or macOS + Xcode for iOS), which this Linux cloud VM does not provide.
  `npm run android` / `npm run ios` cannot be exercised. Run those on a machine
  with the native mobile toolchain, pointing `API_BASE_URL` at a reachable
  backend (on Android use `adb reverse tcp:8021 tcp:8021`).

Standard scripts (`start`, `android`, `ios`, `lint`, `test`) are in `package.json`;
see the repo `README.md`.
