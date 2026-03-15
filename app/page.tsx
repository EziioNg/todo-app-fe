'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';

export default function Home() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const handleTodo = () => {
    if (!user) {
      toast.error('Please login first');
      router.push('/auth/login');
      return;
    }
    if (isAdmin) {
      router.push('/admin');
    } else {
      router.push('/employee/todo');
    }
  };

  const handleLogin = () => {
    if (user) {
      toast.error('You are already logged in');
      return;
    }
    router.push('/auth/login');
  };
  const handleRegister = () => {
    if (user) {
      toast.error('You are already logged in');
      return;
    }
    router.push('/auth/register');
  };

  return (
    <div className="flex min-h-screen items-center justify-center transition-colors">
      <main className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 p-10 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div className="absolute top-4 right-4">
          <Toggle />
        </div>

        <div className="flex flex-col items-center text-center gap-6">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome👋</h1>

          <p className="text-zinc-600 dark:text-zinc-400 max-w-sm">
            Manage your users and tasks, stay productive, keep everything
            organized in one place!.
          </p>

          <Button
            size="lg"
            className="mt-4 px-8 cursor-pointer"
            onClick={handleTodo}
          >
            Go to Todos
          </Button>

          <div className="flex gap-4 mt-2 text-sm">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handleLogin}
            >
              Login
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={handleRegister}
            >
              Register
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
