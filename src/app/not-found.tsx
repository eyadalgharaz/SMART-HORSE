'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brand } from '@/components/layout/brand';
import { useTranslations } from '@/i18n';

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Brand />
      <div>
        <h1 className="text-lg font-semibold">{t.common.notFound.title}</h1>
        <p className="mt-1 text-sm text-stone-600">{t.common.notFound.description}</p>
      </div>
      <Link href="/dashboard">
        <Button>{t.common.notFound.action}</Button>
      </Link>
    </div>
  );
}
