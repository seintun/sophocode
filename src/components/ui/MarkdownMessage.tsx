'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownMessageProps {
  content: string;
  /** Pass Sophia mode colour so code blocks match the current session theme */
  accentColor?: string;
  /** When true, skip block-level elements — for compact floating bubbles */
  compact?: boolean;
  /** Show a blinking cursor at end (for streaming) */
  isStreaming?: boolean;
  /** Cursor colour */
  cursorColor?: string;
  className?: string;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }, [code]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy code'}
      className="sophia-copy-btn"
    >
      {copied ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

/** Recursively extract a plain string from any react-markdown child node tree */
function extractChildText(children: React.ReactNode): string {
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

/** Extract the language identifier from a className like "language-python" in the first child */
function extractLang(children: React.ReactNode): string | null {
  const first = Array.isArray(children) ? children[0] : children;
  if (first === null || first === undefined || typeof first !== 'object') return null;
  const element = first as React.ReactElement<{ className?: string }>;
  if (!('props' in element) || !element.props) return null;
  const cls = element.props.className ?? '';
  if (!cls.startsWith('language-')) return null;
  return cls.replace('language-', '').split(' ')[0] || null;
}

export function MarkdownMessage({
  content,
  accentColor,
  compact = false,
  isStreaming = false,
  cursorColor,
  className = '',
}: MarkdownMessageProps) {
  const accentStyle = accentColor
    ? ({ '--sophia-accent': accentColor } as React.CSSProperties)
    : undefined;

  const components: Components = {
    // Inline and fenced code — never spread react-markdown internal props into DOM elements
    code({ children, className: codeClass }) {
      const isBlock = codeClass?.startsWith('language-');
      if (isBlock) {
        return <code className={`sophia-code-inner ${codeClass ?? ''}`}>{children}</code>;
      }
      return <code className="sophia-inline-code">{children}</code>;
    },

    // Fenced block wrapper
    pre({ children }) {
      if (compact) {
        return <pre className="sophia-pre-compact">{children}</pre>;
      }
      const lang = extractLang(children);
      const codeText = extractChildText(children);
      return (
        <div className="sophia-pre-wrapper">
          <div className="sophia-pre-header">
            {lang && <span className="sophia-lang-label">{lang}</span>}
            <CopyButton code={codeText} />
          </div>
          <pre className="sophia-pre">{children}</pre>
        </div>
      );
    },

    p({ children }) {
      if (compact) return <span className="sophia-p-compact">{children}</span>;
      return <p className="sophia-p">{children}</p>;
    },

    ul({ children }) {
      if (compact) return <>{children}</>;
      return <ul className="sophia-ul">{children}</ul>;
    },
    ol({ children }) {
      if (compact) return <>{children}</>;
      return <ol className="sophia-ol">{children}</ol>;
    },
    li({ children }) {
      if (compact) return <>{children}</>;
      return <li className="sophia-li">{children}</li>;
    },

    blockquote({ children }) {
      if (compact) return <>{children}</>;
      return <blockquote className="sophia-blockquote">{children}</blockquote>;
    },

    hr() {
      return <hr className="sophia-hr" />;
    },

    h1({ children }) {
      return <h1 className="sophia-h1">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="sophia-h2">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="sophia-h3">{children}</h3>;
    },
    h4({ children }) {
      return <h4 className="sophia-h4">{children}</h4>;
    },

    strong({ children }) {
      return <strong className="sophia-strong">{children}</strong>;
    },
    em({ children }) {
      return <em className="sophia-em">{children}</em>;
    },
  };

  return (
    <div className={`sophia-prose ${className}`} style={accentStyle}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span
          className="sophia-cursor"
          style={cursorColor ? { backgroundColor: cursorColor } : undefined}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default MarkdownMessage;
