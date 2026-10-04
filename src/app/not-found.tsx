import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brand } from '@/components/layout/brand';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Brand />
      <div>
        <h1 className="text-lg font-semibold">This page does not exist</h1>
        <p className="mt-1 text-sm text-stone-600">
          The link may be out of date, or the area is not part of SmartHorse yet.
        </p>
      </div>
      <Link href="/dashboard">
        <Button>Go to dashboard</Button>
      </Link>
    </div>
  );
}
