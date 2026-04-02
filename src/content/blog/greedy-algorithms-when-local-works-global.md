---
title: 'Greedy Algorithms: When Local Works Global'
description: 'Greedy solutions can feel like guesswork. This guide shows how to recognize the right problems, justify correctness, and avoid common traps in interviews.'
publishedAt: '2026-01-28'
tags: ['greedy', 'algorithms', 'interview prep', 'proofs']
author: 'sophocode'
---

Greedy algorithms get a bad rap.

People either love them because they are fast and elegant, or avoid them because they seem like "just pick the best option and hope." In interviews, both extremes are risky.

A strong greedy answer is not luck. It is a structured claim:

- A local decision is always safe.
- Repeating that decision leads to a global optimum.

If you cannot explain why the local step is safe, you do not yet have a greedy solution. You have a heuristic.

## What greedy is actually doing

A greedy algorithm commits to decisions immediately and never revisits them.

That gives speed. It also removes safety nets.

Dynamic programming says, "keep options open." Greedy says, "I can prove this option is always good enough to lock in now."

So the interview skill is less about coding and more about identifying proof structure.

## Three classic examples

### 1) Activity selection / non-overlapping intervals

Goal: choose maximum number of non-overlapping intervals.

Correct greedy move: sort by end time, always take the interval that finishes earliest.

Why it works: finishing earlier leaves the most room for future intervals. Any solution that picks a later finishing interval can be exchanged with the earlier one without reducing total count.

This is the exchange argument in action.

### 2) Jump Game

Goal: determine if you can reach the last index.

Correct greedy move: track farthest reachable index while scanning.

Why it works: if your current index is beyond farthest reach, you are stuck forever. If you can keep extending reach, you preserve all future possibilities that matter.

No backtracking needed.

### 3) Minimum number of arrows to burst balloons

Intervals again, different objective.

Sort by end coordinate, shoot at current end, reuse arrow for all overlapping balloons, fire new arrow only when needed.

Local decision minimizes commitment and maximizes reuse.

Same structural logic as interval scheduling, different wording. Pattern recognition wins here.

## Greedy validation checklist

Use this checklist in interviews before you commit:

| Check                | What to ask yourself                                                               | Green flag                                           | Red flag                                      |
| -------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| Objective alignment  | Does local choice directly improve target metric?                                  | Choice clearly advances objective                    | Choice helps now but unclear long-term effect |
| Stay-ahead intuition | Does local choice keep as many future options as alternatives?                     | "Earliest finish" or "largest remaining slack" logic | Choice may block better later arrangement     |
| Exchange argument    | Can I swap a different first choice with greedy choice without hurting optimality? | Yes, swap preserves or improves solution             | Swap argument fails on simple counterexample  |
| No-revisit safety    | Can decisions be made permanently?                                                 | Future does not require undo                         | Later constraints can invalidate early picks  |
| Counterexample probe | Have I tested tricky cases?                                                        | Still holds on edge cases                            | One small case breaks strategy                |

If two rows are red, pause and consider dynamic programming, binary search on answer, or sorting + two pointers instead.

## How to present greedy answers well

Interviewers do not want magic. They want reasoning.

A strong template:

1. State brute force briefly.
2. Propose greedy choice and why it seems safe.
3. Give one-paragraph correctness intuition (exchange/stay-ahead).
4. Code cleanly.
5. Confirm complexity.

Sample language:

"I will sort intervals by end time and always take the earliest finishing one. Intuitively, this leaves maximum room for future picks. If an optimal solution picked a later end first, we can swap in the earlier-ending interval and never reduce the number of intervals we can take afterward. So the greedy choice is safe at each step."

That is usually enough proof depth for interviews.

## Common greedy traps

### Trap 1: Sorting by the wrong key

Interval problems often punish this. Sorting by start time feels natural but may be wrong for objective. Always align sort key with proof, not aesthetics.

### Trap 2: Confusing "works on examples" with "always works"

Many wrong greedy ideas pass five tests and fail the sixth. Build one adversarial case yourself before finalizing.

### Trap 3: Forcing greedy where subproblems overlap

Coin Change (minimum coins with arbitrary denominations) is the classic cautionary tale. Greedy works for some coin systems, fails for others.

If your local choice can poison future choices, DP is often the safer path.

### Trap 4: Ignoring tie-breaking rules

When values are equal, tie-breaking can decide correctness or at least implementation simplicity. Decide it explicitly.

## A practical way to get better fast

Most candidates practice greedy as random isolated questions. Better approach:

- Cluster by proof pattern: interval exchange, reachability, resource allocation.
- Solve 3-4 per cluster in one session.
- After each solution, write one sentence: "the local decision is safe because..."

That sentence is your real training objective. If you can produce it under pressure, greedy becomes reliable instead of scary.

## When to pick greedy in interview time

Choose greedy early when:

- Problem asks for min/max count with intervals or ordering.
- You can sort once, scan once, and never revisit choices.
- You can articulate an exchange or stay-ahead argument in under a minute.

Avoid forcing it when:

- The prompt has explicit revisit/undo dynamics.
- Different local choices create very different future states.
- You cannot justify correctness beyond "it seems right."

A wrong greedy solution typed quickly is still wrong. A correct O(n log n) greedy with a clear proof is often the cleanest win in the room.

## Practice next

- Start with the [Greedy Algorithms practice set](/practice?pattern=GREEDY).
- Track mistakes in [`/dashboard`](/dashboard) and plan the next block in [`/roadmap`](/roadmap).
- SophoCode picks:
  - [Interval scheduling drills](/practice/non-overlapping-intervals)
  - [Reachability greedy drills](/practice/jump-game)
  - [Burst-balloon coverage drills](/practice/insert-interval)
