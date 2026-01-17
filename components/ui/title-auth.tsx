'use client';
import { usePathname } from 'next/navigation';
import { Toggle } from '@/components/ui/toggle';

export function TitleAuth() {
  const pathName = usePathname();
  let title = 'Hello! - Welcome!';

  if (pathName === '/login') {
    title = 'Welcome back!';
  }

  if (pathName === '/register') {
    title = 'Create your account!';
  }

  return (
    <h2 className="w-full flex flex-row justify-between scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      {title}
      <Toggle />
    </h2>
  );
}
