import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';
import { getPostBySlug, getAllPosts } from '@/lib/content';

const DEFAULT_SLUG = 'getting-started';
const DOC_ORDER = [
  'getting-started',
  'practice-workspace-guide',
  'session-modes-explained',
  'hints-policy-and-best-use',
  'progress-and-mastery-guide',
  'roadmap-guide',
  'pattern-taxonomy-reference',
  'common-mistakes-and-how-to-fix',
  'account-guest-and-data-linking',
  'troubleshooting',
];

function sortDocsByImportance<T extends { slug: string }>(docs: T[]): T[] {
  return [...docs].sort((a, b) => {
    const ai = DOC_ORDER.indexOf(a.slug);
    const bi = DOC_ORDER.indexOf(b.slug);
    const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.slug.localeCompare(b.slug);
  });
}

export async function generateStaticParams() {
  const docs = sortDocsByImportance(getAllPosts('docs'));
  return [{ slug: [] }, ...docs.map((doc) => ({ slug: [doc.slug] }))];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const docSlug = slug?.[0] ?? DEFAULT_SLUG;
  const doc = getPostBySlug(docSlug, 'docs');

  if (!doc) {
    return {
      title: 'Documentation Not Found',
      robots: { index: false },
    };
  }

  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    robots: { index: true, follow: true },
    openGraph: {
      title: doc.frontmatter.title,
      description: doc.frontmatter.description,
      type: 'website',
    },
  };
}

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const docSlug = slug?.[0] ?? DEFAULT_SLUG;
  const doc = getPostBySlug(docSlug, 'docs');

  if (!doc) notFound();

  const allDocs = sortDocsByImportance(getAllPosts('docs'));
  const currentIndex = allDocs.findIndex((d) => d.slug === docSlug);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc =
    currentIndex >= 0 && currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:pt-14">
      <header
        className="mb-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-5 py-6 sm:px-8"
        style={{
          background:
            'radial-gradient(circle at top right, color-mix(in srgb, var(--color-accent) 11%, transparent), transparent 55%), var(--color-bg-secondary)',
        }}
      >
        <span className="mb-3 inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)]/60 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
          Docs
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
          {doc.frontmatter.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
          {doc.frontmatter.description}
        </p>
      </header>

      <details className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 md:hidden">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--color-text-primary)]">
          Browse docs
        </summary>
        <ul className="mt-3 space-y-1">
          {allDocs.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/docs/${d.slug}`}
                className={`block rounded-md px-2 py-1.5 text-sm ${
                  d.slug === docSlug
                    ? 'bg-[var(--color-bg-elevated)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)]'
                }`}
              >
                {d.frontmatter.title}
              </Link>
            </li>
          ))}
        </ul>
      </details>

      <div className="flex gap-10">
        <aside className="sticky top-24 hidden h-fit w-64 shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 md:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Documentation
          </p>
          <ul className="space-y-1">
            {allDocs.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/docs/${d.slug}`}
                  className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                    d.slug === docSlug
                      ? 'bg-[var(--color-bg-elevated)] text-[var(--color-accent)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {d.frontmatter.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <article className="min-w-0 flex-1 max-w-[78ch] prose prose-invert prose-headings:tracking-tight prose-headings:text-[var(--color-text-primary)] prose-p:leading-8 prose-p:text-[var(--color-text-secondary)] prose-a:text-[var(--color-accent)] prose-strong:text-[var(--color-text-primary)] prose-code:text-[var(--color-accent)] prose-li:text-[var(--color-text-secondary)] prose-th:text-[var(--color-text-primary)] prose-td:text-[var(--color-text-secondary)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>

          <footer className="mt-12 grid gap-3 border-t border-[var(--color-border)] pt-6 text-sm sm:grid-cols-2">
            {prevDoc ? (
              <Link
                href={`/docs/${prevDoc.slug}`}
                scroll
                className="no-underline rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  Previous
                </span>
                {prevDoc.frontmatter.title}
              </Link>
            ) : (
              <div />
            )}
            {nextDoc ? (
              <Link
                href={`/docs/${nextDoc.slug}`}
                scroll
                className="no-underline rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
              >
                <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  Next
                </span>
                {nextDoc.frontmatter.title}
              </Link>
            ) : (
              <div />
            )}
          </footer>
        </article>
      </div>
    </div>
  );
}
