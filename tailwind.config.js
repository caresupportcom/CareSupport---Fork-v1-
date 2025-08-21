export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // CareSupport OKLCH Color System
        'cs-gap-critical': 'var(--cs-gap-critical)',
        'cs-covered-confirmed': 'var(--cs-covered-confirmed)',
        'cs-maybe-available': 'var(--cs-maybe-available)',
        'cs-text-primary': 'var(--cs-text-primary)',
        'cs-text-secondary': 'var(--cs-text-secondary)',
        'cs-text-on-dark': 'var(--cs-text-on-dark)',
        'cs-bg-page': 'var(--cs-bg-page)',
        'cs-bg-card': 'var(--cs-bg-card)',
        'cs-bg-urgent': 'var(--cs-bg-urgent)',
        
        // Status Colors
        'cs-available': 'var(--cs-available)',
        'cs-tentative': 'var(--cs-tentative)',
        'cs-unavailable': 'var(--cs-unavailable)',
        'cs-scheduled': 'var(--cs-scheduled)',
        'cs-in-progress': 'var(--cs-in-progress)',
        'cs-completed': 'var(--cs-completed)',
        
        // Priority Colors
        'cs-priority-high': 'var(--cs-priority-high)',
        'cs-priority-medium': 'var(--cs-priority-medium)',
        'cs-priority-low': 'var(--cs-priority-low)',
        
        // Interactive Colors
        'cs-interactive-primary': 'var(--cs-interactive-primary)',
        'cs-interactive-hover': 'var(--cs-interactive-hover)',
        'cs-interactive-active': 'var(--cs-interactive-active)',
        
        // CareSupport Gray Scale
        'cs-gray': {
          50: 'var(--cs-gray-50)',
          100: 'var(--cs-gray-100)',
          200: 'var(--cs-gray-200)',
          300: 'var(--cs-gray-300)',
          400: 'var(--cs-gray-400)',
          500: 'var(--cs-gray-500)',
          600: 'var(--cs-gray-600)',
          700: 'var(--cs-gray-700)',
          800: 'var(--cs-gray-800)',
          900: 'var(--cs-gray-900)',
        }
      }
    }
  }
}