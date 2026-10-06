import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen flex flex-col items-center justify-center px-[var(--space-4)] bg-[var(--background)]"
    >
      <h1 className="text-6xl font-bold text-[var(--foreground)]">
        404 <span className="sr-only">— </span>
        <span className="block mt-[var(--space-2)] text-base font-normal text-[var(--muted)]">
          Page not found
        </span>
      </h1>
      <Link
        href="/"
        className="mt-[var(--space-6)] px-[var(--space-4)] py-[var(--space-2)] bg-[var(--accent)] text-[var(--on-accent)] rounded-lg text-sm font-medium"
      >
        Go home
      </Link>
    </main>
  );
}
