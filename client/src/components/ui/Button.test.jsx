import { describe, it, expect } from 'vitest';
import React from 'react';
import { Button } from './Button';
import { Badge } from './Badge';

describe('Design System Primitives', () => {
  describe('Button component', () => {
    it('renders with default primary variant', () => {
      const element = Button({ children: 'Submit' });
      expect(element.props.className).toContain('bg-[#002B55]');
      expect(element.props.type).toBe('button');
    });

    it('applies destructive styling when variant is destructive', () => {
      const element = Button({ children: 'Delete', variant: 'destructive' });
      expect(element.props.className).toContain('bg-rose-600');
    });

    it('disables button when loading is true', () => {
      const element = Button({ children: 'Saving', loading: true });
      expect(element.props.disabled).toBe(true);
    });
  });

  describe('Badge component', () => {
    it('applies success variant styles', () => {
      const element = Badge({ children: 'Active', variant: 'success' });
      expect(element.props.className).toContain('bg-emerald-50');
      expect(element.props.className).toContain('text-emerald-700');
    });

    it('applies danger variant styles', () => {
      const element = Badge({ children: 'Cancelled', variant: 'danger' });
      expect(element.props.className).toContain('bg-rose-50');
      expect(element.props.className).toContain('text-rose-700');
    });
  });
});

