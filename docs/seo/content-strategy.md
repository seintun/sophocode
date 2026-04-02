# SEO — Content Strategy

## Target Keywords

### Primary (high intent, relevant to product)

| Keyword                      | Monthly Volume (est.) | Difficulty | Intent               | Status           |
| ---------------------------- | --------------------- | ---------- | -------------------- | ---------------- |
| coding interview practice    | 8,000                 | High       | Informational / TOFU | Target           |
| coding interview patterns    | 3,500                 | Medium     | Informational        | Blog post exists |
| leetcode patterns            | 5,000                 | High       | Informational        | Blog post exists |
| algorithm interview prep     | 2,500                 | Medium     | Informational        | Target           |
| ai coding interview practice | 800                   | Low        | Navigational         | Home page        |

### Secondary (long-tail, lower competition)

| Keyword                           | Monthly Volume (est.) | Difficulty | Status                             |
| --------------------------------- | --------------------- | ---------- | ---------------------------------- |
| clarify plan code reflect         | 200                   | Low        | Blog post exists                   |
| how to practice coding interviews | 1,200                 | Medium     | Target (expand existing post)      |
| progressive hints coding          | 150                   | Low        | Blog post exists                   |
| sliding window pattern leetcode   | 2,000                 | Medium     | Target (pattern deep-dive post)    |
| two pointers pattern              | 1,500                 | Medium     | Target (pattern deep-dive post)    |
| dynamic programming patterns      | 3,000                 | High       | Target (long-form guide)           |
| spaced repetition programming     | 400                   | Low        | Target (angle: mastery over grind) |

---

## Published Content

### Blog

Current publishing set includes a 12-month archive with 24 posts (roughly 2/month) across:

- Pattern deep dives (Two Pointers, Sliding Window, Hash Maps, Binary Search, Graphs, DP, Heaps, Intervals, Prefix Sum, Greedy, Linked Lists, Backtracking)
- Interview process and communication (mock self-review, debugging under pressure, narration frameworks)
- Learning systems (90-day prep planning, burnout-resistant pacing, year-end reset)
- Complexity literacy (Big-O in interviews, time/space trade-offs)

**Cadence target:** maintain at least 2 high-quality posts per month with pattern-linked "Practice next" sections that route into `/practice?pattern=<PATTERN_ENUM>` plus roadmap/dashboard follow-through.

### Docs

| Page            | Slug              | Purpose                             |
| --------------- | ----------------- | ----------------------------------- |
| Getting Started | `getting-started` | Onboarding, pattern table reference |

---

## Content Roadmap

### Priority 1 — Pattern Deep Dives (highest search volume)

Each post targets a specific pattern keyword. Planned structure:

- What the pattern is and when to use it
- 3 worked examples with code
- Common variations and edge cases
- Link to sophocode problems in that pattern

| Post Cluster                                 | Target Keyword Set                             | Status      |
| -------------------------------------------- | ---------------------------------------------- | ----------- |
| Sliding Window + Two Pointers                | sliding window pattern, two pointers interview | Published   |
| Dynamic Programming + Binary Search          | dynamic programming patterns, answer-space BS  | Published   |
| Graphs + Heaps + Intervals                   | graph interview prep, heap patterns, intervals | Published   |
| Prefix Sum + Greedy                          | prefix sum interview, greedy algorithms        | Published   |
| Additional pattern expansions (Trees, Tries) | tree traversal interview, trie problems        | In planning |

### Priority 2 — Process + Learning Content

| Post                                                 | Target Keyword                 | Status      |
| ---------------------------------------------------- | ------------------------------ | ----------- |
| How to Study for Coding Interviews (Without Burnout) | how to study coding interviews | Not started |
| Spaced Repetition for Algorithm Mastery              | spaced repetition programming  | Not started |
| The 45-Minute Interview Breakdown                    | coding interview tips          | Not started |

### Priority 3 — Comparison + Alternatives (high-intent MOFU)

These target users comparing tools:

| Post                                    | Target Keyword       | Status      |
| --------------------------------------- | -------------------- | ----------- |
| sophocode vs LeetCode: A Wiser Approach | leetcode alternative | Not started |
| Why Patterns Beat Problem Count         | leetcode grinding    | Not started |

---

## Internal Linking Rules

1. **Every blog post** should link to at least one relevant `/practice` problem or pattern page
2. **Pattern deep-dive posts** should link to each other (Sliding Window ↔ Two Pointers)
3. **The docs getting-started page** should link to the top 3 recommended first problems
4. **The blog index** feeds naturally from `/` — add a "Latest from the blog" section to the landing page when there are 5+ posts
5. Include links to recommendation and roadmap surfaces when relevant (`/dashboard`, `/roadmap`) to reflect the current adaptive practice loop

---

## Content Quality Checklist

Before publishing any blog post:

- [ ] Title contains primary keyword
- [ ] Description is 140–160 characters and includes primary keyword
- [ ] At least one H2 contains a secondary keyword naturally
- [ ] Post links to `/practice` or a specific problem at least once
- [ ] Frontmatter has `title`, `description`, `publishedAt`, and `tags`
- [ ] Word count ≥ 1,000 (thin content penalty risk below this)
- [ ] No duplicate `<h1>` — frontmatter title renders as the only H1

---

## GEO (AI Search) Notes

To appear in AI Overviews, Perplexity, and ChatGPT responses:

1. **Definitions first** — open each section with a clear, quotable definition. AI systems extract these for direct answers.
2. **Lists and tables** — structured content is easier for AI to cite than prose paragraphs.
3. **Author/publisher signals** — `Article` JSON-LD with `author` and `publisher` set to the Organization schema helps AI systems attribute the content.
4. **llms.txt** — `public/llms.txt` describes the site for AI crawlers that support the standard.
5. **Unique insight** — AI systems cite sources that say something others don't. Generic advice won't rank in AI or traditional search.
