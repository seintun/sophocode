---
title: 'Heaps and Priority Queues: Interview Cheat Sheet That Actually Helps'
description: 'Heaps are simple once you know when to use min-heap, max-heap, and fixed-size top-K patterns. This cheat sheet focuses on decision speed under interview pressure.'
publishedAt: '2025-11-22'
tags: ['heaps', 'priority queue', 'top k', 'interview prep']
author: 'sophocode'
---

Heaps are one of the highest-leverage interview tools because they solve a very specific class of problems quickly:

"I need repeated access to the smallest/largest item while data changes over time."

Many candidates understand heap operations in isolation but still miss heap opportunities in interviews. The gap is not syntax. It's pattern recognition and trade-off decisions.

This guide is a practical cheat sheet you can use mid-practice.

## Heap intuition in one paragraph

A heap is a partially ordered tree structure usually stored in an array where the root is always the minimum (min-heap) or maximum (max-heap). You pay `O(log n)` to insert/pop, and get `O(1)` access to current min/max.

Compared with sorting once (`O(n log n)`), heaps win when you need repeated best-item retrieval while processing a stream or sliding window.

## Quick decision matrix

Use this table before coding.

| Problem clue                                     | Heap choice                                | Typical complexity                |
| ------------------------------------------------ | ------------------------------------------ | --------------------------------- |
| "K largest/smallest elements"                    | Fixed-size min/max heap of size `k`        | `O(n log k)`                      |
| "Process by earliest finish / shortest duration" | Min-heap by key                            | `O(n log n)` total pushes/pops    |
| "Running median"                                 | Two heaps (max lower half, min upper half) | `O(log n)` update, `O(1)` median  |
| "Merge K sorted lists/streams"                   | Min-heap with tuple `(value, listId, idx)` | `O(N log k)`                      |
| "Need both top and order statistics updates"     | Heap + auxiliary maps/counts               | Depends on lazy deletion strategy |

If the question says "top K" and you fully sort first, you're probably leaving performance on the table.

## Top K pattern: the interview workhorse

The most reusable trick: maintain a heap of size `k`.

- For **k largest**, keep a min-heap of current top candidates.
- For **k smallest**, keep a max-heap of current bottom candidates.

Why it works: the heap root is always the weakest element in your kept set, so eviction is constant-time decision + `log k` rebalance.

This is one of the cleanest demonstrations of "better than sort" thinking.

## Two heaps for running median

This pattern feels advanced but is straightforward with invariants:

1. max-heap `low` stores lower half
2. min-heap `high` stores upper half
3. size difference is at most 1
4. all elements in `low` <= all elements in `high`

Median is then either one root (odd count) or average of both roots (even count).

Most bugs come from rebalancing order. Safe sequence:

- push into appropriate heap by comparison with `low` root
- rebalance sizes
- if ordering violated, swap roots

Speak these invariants in interviews and your implementation becomes much easier to trust.

## Priority queue scheduling pattern

For interval/scheduling problems, a common template is:

1. sort jobs by start time (or arrival)
2. while current time advances, pop completed items from heap
3. push current job/resource end time
4. track peak heap size or chosen item

This covers meeting rooms, CPU task allocation, bandwidth channels, and many simulation questions.

The key is choosing the heap key correctly: usually earliest end time for availability decisions.

## Min-heap vs max-heap language pitfalls

Candidates often say "use max-heap" when they mean "track largest elements." For top-K largest, you typically use a **min-heap** so the smallest among the kept K is easy to evict.

Good phrasing:

"I need quick eviction of the least valuable among my kept top K, so min-heap is the right structure."

That precision scores points.

## Handling deletions and stale entries

Real interview variants sometimes require deleting arbitrary elements or expiring old ones (sliding windows, streaming with removals).

Heaps do not support efficient arbitrary deletion by default. Practical tactic:

- use **lazy deletion** with a hashmap of invalid counts
- when root is stale, pop until valid

This appears in median-in-sliding-window style problems and is a common difficulty jump.

## Complexity framing interviewers like

Avoid generic statements like "heap is faster." Instead say:

- full sort: `O(n log n)`
- fixed-size heap: `O(n log k)`
- when `k << n`, this is significantly better

For streaming settings, emphasize online nature:

"I can return intermediate answers after each insert without recomputing globally."

That's often the deciding argument.

## Common mistakes checklist

- pushing all elements then popping `k` when `k << n` and only top K needed
- forgetting tie-breaker keys in tuple heaps (causes unstable behavior bugs)
- mixing min/max comparator semantics in languages with only one default heap type
- skipping invariant checks after rebalance in two-heap median

These are fixable with a small pre-submit audit:

- heap key matches objective
- size invariant holds
- stale root cleanup present when needed

## Build speed with targeted reps

To get interview-ready, do reps by pattern, not by random feed:

1. 3 top-K problems
2. 2 scheduling/resource allocation problems
3. 2 two-heap median variants
4. 1 K-way merge

After each, write one sentence: "Why heap over sort/queue/tree here?"

That sentence is your transfer mechanism. sophocode's review flow reinforces this by asking for the structure-level decision after each solve, which turns syntax familiarity into real selection speed.

## Practice next

- Start with the [Heaps & Priority Queues practice set](/practice?pattern=HEAPS).
- Track mistakes in [`/dashboard`](/dashboard) and plan the next block in [`/roadmap`](/roadmap).
- SophoCode picks:
  - [Top-k element drills](/practice/kth-largest-element-in-an-array)
  - [Frequency heap drills](/practice/top-k-frequent-elements)
  - [Streaming median drills](/practice/find-median-from-data-stream)
