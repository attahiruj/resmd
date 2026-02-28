/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg:              'var(--color-bg)',
        surface:         'var(--color-surface)',
        'surface-2':     'var(--color-surface-2)',
        'surface-3':     'var(--color-surface-3)',
        border:          'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        text:            'var(--color-text)',
        muted:           'var(--color-text-muted)',
        faint:           'var(--color-text-faint)',
        accent:          'var(--color-accent)',
        'accent-hover':  'var(--color-accent-hover)',
        'accent-muted':  'var(--color-accent-muted)',
        success:         'var(--color-success)',
        warning:         'var(--color-warning)',
        danger:          'var(--color-danger)',
        'success-bg':    'var(--color-success-bg)',
        'danger-bg':     'var(--color-danger-bg)',
        'editor-bg':     'var(--color-editor-bg)',
      },
    },
  },
  plugins: [],
}
