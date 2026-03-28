'use client';

import { type ReactNode } from 'react';
import { MobileWorkspace } from './MobileWorkspace';

interface SessionLayoutProps {
  problem: ReactNode;
  editor: ReactNode;
  testResults: ReactNode;
  coach: ReactNode;
  onRunTests?: () => void;
  onAskCoach?: () => void;
  isRunning?: boolean;
  testResultsData?: { passed: number; total: number };
  problemTitle?: string;
  constraints?: string[];
}

export function SessionLayout({
  problem,
  editor,
  testResults,
  coach,
  onRunTests,
  onAskCoach,
  isRunning,
  testResultsData,
  problemTitle,
  constraints,
}: SessionLayoutProps) {
  return (
    <>
      {/* Desktop: 3-column grid */}
      <div className="hidden h-full md:grid md:grid-cols-[30%_40%_30%]">
        <div className="border-r border-[var(--color-border)] overflow-y-auto">{problem}</div>
        <div className="flex flex-col border-r border-[var(--color-border)] overflow-hidden">
          <div className="flex-1 min-h-0">{editor}</div>
          <div className="border-t border-[var(--color-border)] h-[35%] overflow-y-auto">
            {testResults}
          </div>
        </div>
        <div className="overflow-y-auto">{coach}</div>
      </div>

      {/* Mobile: bottom sheet architecture */}
      <div className="h-full md:hidden">
        <MobileWorkspace
          problem={problem}
          editor={editor}
          testResults={testResults}
          coach={coach}
          onRunTests={onRunTests}
          onAskCoach={onAskCoach}
          isRunning={isRunning}
          testResultsData={testResultsData}
          problemTitle={problemTitle}
          constraints={constraints}
        />
      </div>
    </>
  );
}

export default SessionLayout;
