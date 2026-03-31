'use client';

import { useEffect, useState } from 'react';

const LOADING_MESSAGES = [
  'Reading the problem carefully…',
  'Breaking down the key concepts…',
  'Thinking through the approach…',
  'Crafting a plain-language explanation…',
  'Almost there…',
];

export function ExplanationLoader() {
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
