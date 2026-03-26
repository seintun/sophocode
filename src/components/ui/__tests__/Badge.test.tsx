import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../Badge';

describe('Badge', () => {
  describe('difficulty variant', () => {
    it('renders Easy badge with green styles', () => {
      render(<Badge variant="difficulty" level="Easy" />);
      const badge = screen.getByText('Easy');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('--color-success');
    });

    it('renders Medium badge with yellow styles', () => {
      render(<Badge variant="difficulty" level="Medium" />);
      const badge = screen.getByText('Medium');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('--color-warning');
    });

    it('renders Hard badge with red styles', () => {
      render(<Badge variant="difficulty" level="Hard" />);
      const badge = screen.getByText('Hard');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('--color-error');
    });
  });

  describe('pattern variant', () => {
    it('renders pattern badge with accent color', () => {
      render(<Badge variant="pattern" label="Hash Maps" />);
      const badge = screen.getByText('Hash Maps');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('--color-accent');
    });
  });

  describe('mastery variant', () => {
    it('renders UNSEEN mastery state', () => {
      render(<Badge variant="mastery" state="UNSEEN" />);
      expect(screen.getByText('UNSEEN')).toBeInTheDocument();
    });

    it('renders MASTERED mastery state with green', () => {
      render(<Badge variant="mastery" state="MASTERED" />);
      const badge = screen.getByText('MASTERED');
      expect(badge.className).toContain('--color-success');
    });

    it('renders NEEDS_REFRESH with error color', () => {
      render(<Badge variant="mastery" state="NEEDS_REFRESH" />);
      const badge = screen.getByText('NEEDS REFRESH');
      expect(badge.className).toContain('--color-error');
    });
  });

  it('merges custom className', () => {
    render(<Badge variant="difficulty" level="Easy" className="extra" />);
    const badge = screen.getByText('Easy');
    expect(badge.className).toContain('extra');
  });
});
