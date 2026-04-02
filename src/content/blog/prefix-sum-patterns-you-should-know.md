---
title: 'Prefix Sum Patterns You Should Know'
description: 'Prefix sums look basic, but they quietly power some of the highest-frequency interview wins. Learn when to use them, when not to, and how to avoid common traps.'
publishedAt: '2026-01-10'
tags: ['prefix sum', 'arrays', 'interview prep', 'algorithms']
author: 'sophocode'
---

Prefix sums are one of those patterns people label "easy" and still miss in interviews.

Why? Because most candidates learn only one version: build cumulative array, answer range sum query. Useful, but incomplete.

In real interviews, prefix sums appear in three distinct shapes:

1. Static range queries
2. Subarray counting via hashmap
3. 2D matrix accumulation

If you can identify which shape you are in within the first minute, you often turn an O(n2) idea into O(n) or O(nm) almost immediately.

## The mental model

`prefix[i]` means "sum of elements before index `i`" (exclusive form), or "up to index `i`" (inclusive form). Both are valid. Pick one and stay consistent.

The reusable identity is:

`sum(l..r) = prefix[r + 1] - prefix[l]` (exclusive form)

That single subtraction is the whole game. Every prefix sum problem is a creative way of asking for this subtraction once, many times, or with a condition.

## Pattern 1: Static range sum queries

This is the canonical use case. You are given an array and many queries like "what is the sum from index `l` to `r`?"

Brute force per query is O(length of range), which can blow up. Prefix sums preprocess once in O(n), then each query is O(1).

Example:

- `nums = [3, -1, 4, 1, 5]`
- Exclusive prefix: `[0, 3, 2, 6, 7, 12]`
- Sum `1..3` is `prefix[4] - prefix[1] = 7 - 3 = 4`

Interview signal: if the prompt mentions "multiple range queries" or "many queries on fixed data," prefix sums should be your default thought.

## Pattern 2: Count subarrays with target sum

This is where many candidates get stuck, because range queries are not explicit. The problem asks:

"How many subarrays sum to `k`?"

The trick:

- Let current prefix be `curr`
- You need earlier prefix `curr - k`
- Every time that value has appeared before, it forms one valid subarray ending here

So you keep a hashmap `freq[prefixValue] = count`.

Walkthrough on `nums = [1, 2, 1, 2, 1]`, `k = 3`:

- Start with `freq[0] = 1` (critical base case)
- Running sums: 1, 3, 4, 6, 7
- At `curr = 3`, need `0` -> +1 subarray
- At `curr = 4`, need `1` -> +1
- At `curr = 6`, need `3` -> +1
- At `curr = 7`, need `4` -> +1

Total = 4.

Without the base case `freq[0] = 1`, you miss subarrays that start at index 0. That mistake is common and avoidable.

## Pattern 3: 2D prefix sums for matrix rectangles

In matrix problems, prefix sums become a table where each cell stores sum of rectangle from `(0,0)` to `(r,c)`.

Then any rectangle can be extracted using inclusion-exclusion.

Formula (inclusive style):

`rect(r1,c1,r2,c2) = P[r2][c2] - P[r1-1][c2] - P[r2][c1-1] + P[r1-1][c1-1]`

If boundary conditions make this ugly, create a padded `(rows+1) x (cols+1)` table and use exclusive indices. It usually reduces bugs under interview pressure.

Interview signal: phrases like "sum of submatrix" or "many rectangular queries" are near-certain 2D prefix sum cues.

## Prefix Sum Choice Framework

| Problem signal                  | Best variant                       | Core data structure  | Typical complexity      |
| ------------------------------- | ---------------------------------- | -------------------- | ----------------------- |
| Many sum queries on fixed array | 1D prefix array                    | Array                | Build O(n), query O(1)  |
| Count subarrays meeting target  | Running prefix + difference lookup | Hashmap              | O(n) time, O(n) space   |
| Many rectangle sum queries      | 2D prefix table                    | Matrix               | Build O(rc), query O(1) |
| Need updates between queries    | Not pure prefix sum                | Fenwick/segment tree | O(log n) update/query   |

The last row matters: prefix sums are great for read-heavy static data. If updates are frequent, switch patterns early instead of forcing the wrong tool.

## Common failure modes (and quick fixes)

### 1) Off-by-one in prefix definition

Fix: say out loud whether your prefix is inclusive or exclusive. Write one test range by hand before coding loops.

### 2) Missing initial hashmap entry

Fix: for counting-subarray problems, initialize `freq[0] = 1` before iterating.

### 3) Overflow with large values

Fix: in Java/C++, use `long`/`long long` for running sums.

### 4) Using prefix sums in mutable-query problems

Fix: if prompt includes updates, acknowledge prefix idea first, then pivot to Fenwick or segment tree.

Interviewers like seeing that pivot because it shows you understand pattern boundaries, not just pattern recipes.

## A clean interview script you can reuse

When you spot prefix sums, narrate your plan in this sequence:

1. "Brute force would recompute each range repeatedly, which is too slow."
2. "I will preprocess cumulative sums so each query is subtraction of two prefixes."
3. "For counting subarrays, I will store prefix frequencies and look for `curr - k`."
4. "Complexity is O(n) preprocessing and O(1) query (or O(n) total for count variant)."

That script is short, clear, and shows algorithmic intent before code.

## Where this pattern fits in your prep

Prefix sums are not a niche trick. They are a foundational bridge between arrays and hashmaps, and they often appear in medium problems that decide whether an interview round feels smooth or chaotic.

If your current habit is trying sliding window first for every array problem, prefix sums will fix a lot of false starts. Sliding window needs monotonic behavior in many cases. Prefix sums do not. They handle negatives well and keep algebra simple.

Get this pattern solid, and you buy yourself speed and confidence across multiple categories: range query, counting, matrix, and even some dynamic programming transitions.

## Practice next

- Start with the [Prefix Sum practice set](/practice?pattern=PREFIX_SUM).
- Track mistakes in [`/dashboard`](/dashboard) and plan the next block in [`/roadmap`](/roadmap).
- SophoCode picks:
  - [1D range-query drills](/practice/maximum-subarray)
  - [Prefix-count map drills](/practice/maximum-subarray)
  - [2D prefix matrix drills](/practice/maximum-subarray)
