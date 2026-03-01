/**
 * resmd Theme System
 *
 * Themes are TypeScript objects that map to CSS custom properties.
 * This file is the single source of truth for all color decisions.
 *
 * Architecture:
 *   - Default experience is dark mode. Light mode is the opt-in variant.
 *   - globals.css `:root` hard-codes the inkglow dark palette for SSR / no-JS.
 *   - `applyTheme(id, mode)` writes the active scale to CSS custom properties
 *     inline on <html>, and adds/removes the `.light` class for light mode.
 *   - Relevant localStorage keys:
 *     resmd_theme    — 'light' | 'dark'
 *     resmd_theme_id — theme ID string (e.g. 'inkglow')
 *
 * Adding a new theme:
 *   1. Create a Theme object below
 *   2. Add it to the THEMES array
 *   3. It will be available in the theme picker automatically
 */

export type ThemeMode = 'light' | 'dark';

export interface ThemeScale {
  // Surfaces
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  surfaceOverlay: string;
  // Borders
  border: string;
  borderStrong: string;
  borderFocus: string;
  // Text
  text: string;
  textMuted: string;
  textFaint: string;
  textInverse: string;
  // Primary accent (CTA buttons, focus rings, highlights)
  accent: string;
  accentHover: string;
  accentActive: string;
  accentMuted: string;
  accentMutedHover: string;
  accentText: string;
  // Secondary accent (Glacier Blue — AI moments)
  secondary: string;
  secondaryHover: string;
  secondaryActive: string;
  secondaryMuted: string;
  // Status
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  info: string;
  infoBg: string;
  // Editor
  editorBg: string;
  editorGutter: string;
  editorLineHl: string;
  editorSelection: string;
  editorCursor: string;
  // Scrollbar
  scrollbarThumb: string;
  // Shadows
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
  shadowAccent: string;
  shadowAccentStrong: string;
}

export interface Theme {
  id: string;
  name: string;
  light: ThemeScale;
  dark: ThemeScale;
}

// ---------------------------------------------------------------------------
// Built-in themes
// ---------------------------------------------------------------------------

const INKGLOW: Theme = {
  id: 'inkglow',
  name: 'Ink & Glow',
  dark: {
    bg: '#1B1B1E',
    surface: '#222226',
    surface2: '#2A2A2E',
    surface3: '#313137',
    surfaceOverlay: 'rgba(27, 27, 30, 0.85)',
    border: '#2E2E34',
    borderStrong: '#3A3A42',
    borderFocus: '#C8F135',
    text: '#E8E6DF',
    textMuted: '#8A8A92',
    textFaint: '#48484F',
    textInverse: '#1B1B1E',
    accent: '#C8F135',
    accentHover: '#D4F84E',
    accentActive: '#B0DA20',
    accentMuted: 'rgba(200, 241, 53, 0.10)',
    accentMutedHover: 'rgba(200, 241, 53, 0.16)',
    accentText: '#0D0F14',
    secondary: '#4DAAFF',
    secondaryHover: '#69B8FF',
    secondaryActive: '#3494E6',
    secondaryMuted: 'rgba(77, 170, 255, 0.10)',
    success: '#4ADE80',
    successBg: 'rgba(74, 222, 128, 0.10)',
    warning: '#FBBF24',
    warningBg: 'rgba(251, 191, 36, 0.10)',
    danger: '#F87171',
    dangerBg: 'rgba(248, 113, 113, 0.10)',
    info: '#4DAAFF',
    infoBg: 'rgba(77, 170, 255, 0.10)',
    editorBg: '#1B1B1E',
    editorGutter: '#222226',
    editorLineHl: 'rgba(200, 241, 53, 0.04)',
    editorSelection: 'rgba(200, 241, 53, 0.15)',
    editorCursor: '#C8F135',
    scrollbarThumb: '#3A3A42',
    shadowSm: '0 1px 3px rgba(0,0,0,0.4)',
    shadowMd: '0 4px 16px rgba(0,0,0,0.5)',
    shadowLg: '0 8px 32px rgba(0,0,0,0.6)',
    shadowXl: '0 16px 56px rgba(0,0,0,0.7)',
    shadowAccent: '0 0 20px rgba(200, 241, 53, 0.20)',
    shadowAccentStrong: '0 0 40px rgba(200, 241, 53, 0.30)',
  },
  light: {
    bg: '#F9F8F5',
    surface: '#FFFFFF',
    surface2: '#F3F2EE',
    surface3: '#E8E6DF',
    surfaceOverlay: 'rgba(249, 248, 245, 0.90)',
    border: '#E2E0D8',
    borderStrong: '#C8C5BA',
    borderFocus: '#8BBF1A',
    text: '#1A1C23',
    textMuted: '#5A5E6E',
    textFaint: '#9CA3AF',
    textInverse: '#FFFFFF',
    accent: '#7AA314',
    accentHover: '#6A8F10',
    accentActive: '#5A7A0D',
    accentMuted: 'rgba(122, 163, 20, 0.10)',
    accentMutedHover: 'rgba(122, 163, 20, 0.16)',
    accentText: '#FFFFFF',
    secondary: '#0073CC',
    secondaryHover: '#005FA8',
    secondaryActive: '#004D8A',
    secondaryMuted: 'rgba(0, 115, 204, 0.08)',
    success: '#15803D',
    successBg: '#DCFCE7',
    warning: '#B45309',
    warningBg: '#FEF3C7',
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
    info: '#0073CC',
    infoBg: '#DBEAFE',
    editorBg: '#FAFAF8',
    editorGutter: '#F0EFEB',
    editorLineHl: 'rgba(122, 163, 20, 0.05)',
    editorSelection: 'rgba(122, 163, 20, 0.12)',
    editorCursor: '#7AA314',
    scrollbarThumb: '#C8C5BA',
    shadowSm: '0 1px 3px rgba(0,0,0,0.08)',
    shadowMd: '0 4px 16px rgba(0,0,0,0.10)',
    shadowLg: '0 8px 32px rgba(0,0,0,0.12)',
    shadowXl: '0 16px 56px rgba(0,0,0,0.15)',
    shadowAccent: '0 0 20px rgba(122, 163, 20, 0.15)',
    shadowAccentStrong: '0 0 40px rgba(122, 163, 20, 0.25)',
  },
};

export const THEMES: Theme[] = [INKGLOW];

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? INKGLOW;
}

/** Map a ThemeScale to CSS custom property names */
function scaleToCSSVars(scale: ThemeScale): Record<string, string> {
  return {
    '--color-bg': scale.bg,
    '--color-surface': scale.surface,
    '--color-surface-2': scale.surface2,
    '--color-surface-3': scale.surface3,
    '--color-surface-overlay': scale.surfaceOverlay,
    '--color-border': scale.border,
    '--color-border-strong': scale.borderStrong,
    '--color-border-focus': scale.borderFocus,
    '--color-text': scale.text,
    '--color-text-muted': scale.textMuted,
    '--color-text-faint': scale.textFaint,
    '--color-text-inverse': scale.textInverse,
    '--color-accent': scale.accent,
    '--color-accent-hover': scale.accentHover,
    '--color-accent-active': scale.accentActive,
    '--color-accent-muted': scale.accentMuted,
    '--color-accent-muted-hover': scale.accentMutedHover,
    '--color-accent-text': scale.accentText,
    '--color-secondary': scale.secondary,
    '--color-secondary-hover': scale.secondaryHover,
    '--color-secondary-active': scale.secondaryActive,
    '--color-secondary-muted': scale.secondaryMuted,
    '--color-success': scale.success,
    '--color-success-bg': scale.successBg,
    '--color-warning': scale.warning,
    '--color-warning-bg': scale.warningBg,
    '--color-danger': scale.danger,
    '--color-danger-bg': scale.dangerBg,
    '--color-info': scale.info,
    '--color-info-bg': scale.infoBg,
    '--color-editor-bg': scale.editorBg,
    '--color-editor-gutter': scale.editorGutter,
    '--color-editor-line-hl': scale.editorLineHl,
    '--color-editor-selection': scale.editorSelection,
    '--color-editor-cursor': scale.editorCursor,
    '--scrollbar-thumb': scale.scrollbarThumb,
    '--shadow-sm': scale.shadowSm,
    '--shadow-md': scale.shadowMd,
    '--shadow-lg': scale.shadowLg,
    '--shadow-xl': scale.shadowXl,
    '--shadow-accent': scale.shadowAccent,
    '--shadow-accent-strong': scale.shadowAccentStrong,
  };
}

/**
 * Apply a theme + mode to the document.
 *
 * - Dark is the default (`:root` in globals.css). For dark mode, remove `.light`.
 * - For light mode, add `.light` class on <html> (globals.css defines overrides).
 * - For non-default themes, write CSS vars inline to override globals.css.
 * - Persists selections to localStorage.
 */
export function applyTheme(themeId: string, mode: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Toggle .light class — dark is the default, light is opt-in
  if (mode === 'light') {
    root.classList.add('light');
  } else {
    root.classList.remove('light');
  }

  const theme = getTheme(themeId);
  const ALL_VARS = Object.keys(scaleToCSSVars(theme.dark));

  if (themeId === 'inkglow') {
    // Default theme: CSS vars in globals.css are authoritative.
    // Clear any inline overrides from a previous non-default theme.
    for (const key of ALL_VARS) {
      root.style.removeProperty(key);
    }
  } else {
    // Non-default theme: write the active scale inline to override globals.css
    const scale = mode === 'dark' ? theme.dark : theme.light;
    const vars = scaleToCSSVars(scale);
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
  }

  localStorage.setItem('resmd_theme', mode);
  localStorage.setItem('resmd_theme_id', themeId);
}

/**
 * Read stored preferences and return them.
 * Safe to call on the server (returns defaults).
 * Default mode is dark (dark-first design).
 */
export function getStoredThemePrefs(): { themeId: string; mode: ThemeMode } {
  if (typeof window === 'undefined')
    return { themeId: 'inkglow', mode: 'dark' };
  const themeId = localStorage.getItem('resmd_theme_id') ?? 'inkglow';
  const stored = localStorage.getItem('resmd_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // Default to dark unless user has explicitly chosen light or prefers light
  const mode: ThemeMode =
    stored === 'dark' || stored === 'light'
      ? (stored as ThemeMode)
      : prefersDark
        ? 'dark'
        : 'light';
  return { themeId, mode };
}
