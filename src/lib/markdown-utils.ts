import type React from 'react';

/**
 * Recursively extract plain text from React nodes (primarily react-markdown AST).
 * Essential for copy-to-clipboard functionality and calculating durations.
 */
export function extractChildText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractChildText).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    const element = children as React.ReactElement<{ children?: React.ReactNode }>;
    const childChildren = element.props?.children;
    if (childChildren !== undefined) {
      return extractChildText(childChildren);
    }
  }
  return '';
}

/**
 * Extract the language identifier from a className like "language-python".
 * Used to identify code blocks in markdown for proper syntax highlighting and labeling.
 */
export function extractLang(children: React.ReactNode): string | null {
  const first = Array.isArray(children) ? children[0] : children;
  if (first === null || first === undefined || typeof first !== 'object') return null;
  const element = first as React.ReactElement<{ className?: string }>;
  if (!('props' in element) || !element.props) return null;
  const cls = element.props.className ?? '';
  if (!cls.startsWith('language-')) return null;
  return cls.replace('language-', '').split(' ')[0] || null;
}
