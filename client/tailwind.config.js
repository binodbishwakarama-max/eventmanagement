import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.resolve(__dirname, 'index.html'),
    path.resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'Menlo',
          'Monaco',
          'monospace',
        ],
      },
      colors: {
        // DSU Design Tokens
        dsu: {
          navy: '#002B55',       // Primary navy
          'navy-deep': '#001B36', // Deep navy
          gold: '#D9A521',        // Accent gold
          bg: '#F7F8FA',          // Main background
          text: '#172033',        // Primary text
          muted: '#64748B',       // Secondary text
          border: '#E5E7EB',      // Clean borders
        },
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
};
