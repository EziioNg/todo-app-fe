import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-800 transition-colors">
      <main className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 p-10 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="absolute top-4 right-4">
          <Toggle />
        </div>

        <div className="flex flex-col items-center text-center gap-6">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome👋</h1>

          <p className="text-zinc-600 dark:text-zinc-400 max-w-sm">
            Manage your tasks, stay productive, and keep everything organized in
            one place.
          </p>

          <Link href="/todo">
            <Button size="lg" className="mt-4 px-8 cursor-pointer">
              Go to Todo
            </Button>
          </Link>

          <div className="flex gap-4 mt-2 text-sm">
            <Link href="/login">
              <Button variant="outline" className="cursor-pointer">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="cursor-pointer">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
