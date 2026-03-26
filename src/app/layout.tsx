import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'patrncode — AI Coding Interview Practice',
  description:
    'Practice coding interviews with an AI coach. Pattern-based learning, progressive hints, and process-first sessions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <nav className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-3">
          <Link
            href="/"
            className="text-xl font-bold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            patrncode
          </Link>
          <div className="flex items-center gap-6">
            <NavLink href="/practice">Practice</NavLink>
            <NavLink href="/progress">Progress</NavLink>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-sm text-[var(--color-text-muted)]"
            aria-label="Guest user"
          >
            G
          </div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] data-[active=true]:text-[var(--color-accent)]"
    >
      {children}
    </Link>
  );
}
