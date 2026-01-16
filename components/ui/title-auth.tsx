import { Toggle } from '@/components/ui/toggle';

export function TitleAuth() {
  return (
    <h2 className="w-full flex flex-row justify-between scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      Hello! - Welcome!
      <Toggle />
    </h2>
  );
}
