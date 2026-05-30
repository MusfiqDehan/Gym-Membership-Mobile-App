/**
 * Fitssort brand palette for use in places where Tailwind/NativeWind class
 * names are not convenient (StatusBar, ActivityIndicator tint, gradients,
 * navigation theme, etc.). Mirrors the web app's dark theme.
 */
export const colors = {
  brand: '#FFC300',
  brandLight: '#FFCF2D',
  brandDark: '#E0AB00',
  bg: '#050505',
  bgAlt: '#090909',
  card: '#141414',
  cardAlt: '#1c1c1c',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.18)',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.62)',
  textFaint: 'rgba(255,255,255,0.40)',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
} as const;

export type AppColor = keyof typeof colors;
