import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-sage-deep">
          Studio
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-ink/60">
          Magic link — no password. Check your inbox after submitting.
        </p>
        <form action={loginAction} className="mt-8 space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            defaultValue="hq@tearoom.world"
            className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-sage-deep"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-ink/90"
          >
            Send magic link
          </button>
          {message && (
            <p className="text-sm text-sage-deep">
              {decodeURIComponent(message)}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
