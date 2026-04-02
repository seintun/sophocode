const CODE_FENCE_RE = /```[\s\S]*?```/g;

const REFUSAL_MESSAGE =
  "I can't provide pseudocode or copy-pastable implementation. I can still help with conceptual guidance: identify the pattern, define the invariant, and test edge cases step by step.";

type CoachMode = 'SELF_PRACTICE' | 'COACH_ME' | 'MOCK_INTERVIEW';

function isCodeLikeLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  if (/^[-*]\s+/.test(trimmed)) return false;

  if (
    /^(def|function|class|for|while|if|elif|else|return|const|let|var|public|private|protected)\b/i.test(
      trimmed,
    )
  ) {
    return true;
  }

  if (/\w+\s*=\s*.+/.test(trimmed)) return true;
  if (/\{.*\}|=>|;\s*$/.test(trimmed)) return true;
  if (/\w+\(.*\):?$/.test(trimmed)) return true;

  return false;
}

function containsPseudoCode(content: string): boolean {
  const lines = content.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length < 3) return false;

  let codeLikeCount = 0;
  let maxStreak = 0;
  let currentStreak = 0;

  for (const line of lines) {
    if (isCodeLikeLine(line)) {
      codeLikeCount++;
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return codeLikeCount >= 4 || maxStreak >= 3;
}

function looksLikeFullSolution(content: string): boolean {
  const lines = content.split('\n').filter((line) => line.trim().length > 0);
  const codeLikeCount = lines.filter(isCodeLikeLine).length;
  const hasFunctionSignature = lines.some((line) =>
    /^\s*(def\s+\w+\s*\(|function\s+\w+\s*\(|const\s+\w+\s*=\s*\()/.test(line.trim()),
  );
  const hasReturn = lines.some((line) => /^\s*return\b/.test(line.trim()));

  return codeLikeCount >= 6 && hasFunctionSignature && hasReturn;
}

export function sanitizeCoachingContent(content: string, options?: { mode?: CoachMode }): string {
  if (!content) return content;

  const stripped = content.replace(CODE_FENCE_RE, '[Code removed by coach safety policy]');
  const mode = options?.mode ?? 'COACH_ME';

  if (looksLikeFullSolution(stripped)) {
    return REFUSAL_MESSAGE;
  }

  if (mode !== 'SELF_PRACTICE' && containsPseudoCode(stripped)) {
    return REFUSAL_MESSAGE;
  }

  return stripped.replace(/\n{3,}/g, '\n\n').trim();
}
