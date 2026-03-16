import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-zinc-300">404</h1>
      <p className="mt-2 text-zinc-600">Page not found</p>
      <Link
        href="/"
        className="mt-6 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800"
      >
        Go home
      </Link>
    </div>
  );
}
