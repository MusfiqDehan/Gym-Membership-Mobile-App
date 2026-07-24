import Config from 'react-native-config';

/**
 * API base URL. Resolved from the build-time .env file via react-native-config
 * (debug -> .env, release -> .env.production). Falls back to the Android
 * emulator loopback host so the JS layer still has a sane default before the
 * native module is available.
 */
export const API_BASE_URL: string =
  (Config.API_BASE_URL && Config.API_BASE_URL.trim()) ||
  'http://localhost:8021/api/v1';
