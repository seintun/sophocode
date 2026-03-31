'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MarkdownMessage } from '@/components/ui/MarkdownMessage';
import type { SessionMode } from '@/generated/prisma/enums';

type TabKey = 'statement' | 'examples' | 'notes' | 'explanation';

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface ProblemPanelProps {
  problem: {
    title: string;
    statement: string;
    examples: Example[];
    constraints: string[];
    starterCode?: string;
    pattern: string;
    difficulty: string;
  };
  notes: string;
  onNotesChange: (notes: string) => void;
  mode: SessionMode;
  explanationStream?: { text: string; isLoading: boolean };
  getExplanation?: () => void;
  /** Used as the localStorage cache key — prefer this over problem title for uniqueness */
  sessionId?: string;
}

const LOADING_MESSAGES = [
  'Reading the problem carefully…',
  'Breaking down the key concepts…',
  'Thinking through the approach…',
  'Crafting a plain-language explanation…',
  'Almost there…',
];

function ExplanationLoader() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="explanation-loader" aria-live="polite" aria-label="Generating explanation">
      <div className="explanation-loader-avatar">
        <span className="explanation-loader-ring" />
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="explanation-loader-icon"
        >
          <path d="M12 2a10 10 0 1 0 10 10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>

      <p key={msgIndex} className="explanation-loader-msg">
        {LOADING_MESSAGES[msgIndex]}
      </p>

      <div className="explanation-loader-skeleton">
        {[100, 85, 92, 60].map((w, i) => (
          <div
            key={i}
            className="explanation-loader-line"
            style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
          />
        ))}
        <div className="explanation-loader-gap" />
        {[95, 80, 88].map((w, i) => (
          <div
            key={i + 4}
            className="explanation-loader-line"
            style={{ width: `${w}%`, animationDelay: `${(i + 4) * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}


export function ProblemPanel({
  problem,
  notes,
  onNotesChange,
  mode,
  explanationStream,
  getExplanation,
  sessionId,
}: ProblemPanelProps) {
  const showExplanation = mode !== 'MOCK_INTERVIEW';
  const [activeTab, setActiveTab] = useState<TabKey>('statement');

  // Cache key: prefer sessionId (unique per attempt), fall back to problem title
  const storageKey = `sophia-explanation:${sessionId ?? problem.title}`;

  // Persist explanation across page reloads
  const [cachedText, setCachedText] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKey) ?? '';
    } catch {
      return '';
    }
  });

  // Save to localStorage whenever the stream finishes loading with content
  useEffect(() => {
    const text = explanationStream?.text;
    const done = text && !explanationStream?.isLoading;
    if (done) {
      try {
        localStorage.setItem(storageKey, text);
      } catch {
        // quota exceeded or SSR — silently ignore
      }
      setCachedText(text);
    }
  }, [explanationStream?.text, explanationStream?.isLoading, storageKey]);

  // What to actually show: live stream text (if any) or cached
  const displayText = explanationStream?.text || cachedText;
  const hasContent = Boolean(displayText);
  const isLoading = Boolean(explanationStream?.isLoading);

  // NOTE: intentionally NOT auto-triggering generation on tab click
  const handleTabClick = (tab: TabKey) => setActiveTab(tab);

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'statement', label: 'Statement' },
    { key: 'examples', label: 'Examples' },
    ...(showExplanation ? [{ key: 'explanation' as const, label: 'Explanation' }] : []),
    { key: 'notes', label: 'Notes' },
  ];

  return (
    <div className="flex h-full flex-col">
      <div
        data-bottomsheet-drag="true"
        className="border-b border-[var(--color-border)] px-4 py-3 cursor-grab active:cursor-grabbing touch-none select-none"
      >
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{problem.title}</h2>
      </div>

      <div
        role="tablist"
        aria-label="Problem details"
        className="flex border-b border-[var(--color-border)]"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`panel-${tab.key}`}
            id={`tab-${tab.key}`}
            onClick={() => handleTabClick(tab.key)}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]',
              activeTab === tab.key
                ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Statement */}
        <div
          role="tabpanel"
          id="panel-statement"
          aria-labelledby="tab-statement"
          hidden={activeTab !== 'statement'}
        >
          {activeTab === 'statement' && (
            <div className="space-y-4">
              <MarkdownMessage content={problem.statement} />
              {problem.constraints.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-secondary)]">
                    Constraints
                  </h3>
                  <ul className="list-inside list-disc space-y-1 text-sm text-[var(--color-text-primary)]">
                    {problem.constraints.map((constraint, i) => (
                      <li key={i}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Examples */}
        <div
          role="tabpanel"
          id="panel-examples"
          aria-labelledby="tab-examples"
          hidden={activeTab !== 'examples'}
        >
          {activeTab === 'examples' && (
            <div className="space-y-4">
              {problem.examples.map((example, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3"
                >
                  <div className="mb-1 text-xs font-medium text-[var(--color-text-muted)]">
                    Example {i + 1}
                  </div>
                  <div className="space-y-2 font-[family-name:var(--font-geist-mono)] text-sm">
                    <div>
                      <span className="text-[var(--color-text-muted)]">Input: </span>
                      <span className="text-[var(--color-text-primary)]">{example.input}</span>
                    </div>
                    <div>
                      <span className="text-[var(--color-text-muted)]">Output: </span>
                      <span className="text-[var(--color-text-primary)]">{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="text-[var(--color-text-muted)]">Explanation: </span>
                        <span className="text-[var(--color-text-secondary)]">
                          {example.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div
            role="tabpanel"
            id="panel-explanation"
            aria-labelledby="tab-explanation"
            hidden={activeTab !== 'explanation'}
          >
            {activeTab === 'explanation' && (
              <div className="space-y-4">
                {/* CTA — not yet generated and not loading */}
                {!hasContent && !isLoading && (
                  <div className="explanation-cta">
                    <div className="explanation-cta-icon" aria-hidden="true">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </div>

                    <h3 className="explanation-cta-title">AI Explanation</h3>
                    <p className="explanation-cta-desc">
                      Sophia will break this problem down into plain English — covering the core
                      concept, the approach, and why it works. Great when you&apos;re stuck or want
                      a deeper understanding.
                    </p>

                    <div className="explanation-cta-hint">
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
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      Uses AI · May take 10–20 seconds · Saved for this session
                    </div>

                    <button
                      type="button"
                      onClick={() => getExplanation?.()}
                      disabled={!getExplanation}
                      aria-label="Generate AI explanation for this problem"
                      className="explanation-cta-btn"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Generate Explanation
                    </button>
                  </div>
                )}

                {/* Loading skeleton */}
                {isLoading && !hasContent && <ExplanationLoader />}

                {/* Content — live stream or cached */}
                {hasContent && (
                  <div className="sophia-explanation">
                    <MarkdownMessage
                      content={displayText}
                      accentColor="var(--color-ai-coach)"
                      isStreaming={isLoading}
                      cursorColor="var(--color-ai-coach)"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div
          role="tabpanel"
          id="panel-notes"
          aria-labelledby="tab-notes"
          hidden={activeTab !== 'notes'}
        >
          {activeTab === 'notes' && (
            <>
              <label htmlFor="notes-textarea" className="sr-only">
                Personal notes for this problem
              </label>
              <textarea
                id="notes-textarea"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                aria-label="Personal notes for this problem"
                placeholder="Jot down your thoughts, approach, or edge cases..."
                className="h-full w-full min-h-[300px] resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProblemPanel;
