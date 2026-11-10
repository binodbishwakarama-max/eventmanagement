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
          'navy-dark': '#00142A', // Ultra deep space navy
          'navy-light': '#003F7D', // Interactive hover navy
          gold: '#D9A521',        // Accent gold
          'gold-light': '#F5C84C',// Radiant champagne gold
          'gold-dark': '#B3820F', // Rich dark gold
          bg: '#F8FAFC',          // Crisp modern backdrop
          surface: '#FFFFFF',     // Clean card surface
          text: '#0F172A',        // High-contrast primary text
          muted: '#64748B',       // Refined secondary text
          border: '#E2E8F0',      // Soft micro-borders
        },
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'soft': '0 2px 12px -2px rgba(0, 0, 0, 0.06), 0 8px 24px -4px rgba(0, 43, 85, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 10px 24px -5px rgba(0, 43, 85, 0.06)',
        'card-hover': '0 20px 35px -8px rgba(0, 43, 85, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'glow-gold': '0 0 25px -4px rgba(217, 165, 33, 0.35)',
        'glow-navy': '0 0 35px -5px rgba(0, 43, 85, 0.3)',
        'ticket': '0 20px 40px -15px rgba(0, 27, 54, 0.15)',
      },
      animation: {
        'ticker': 'ticker 40s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
};
