'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { useTranslations } from '@/i18n';
import { useCreateHorse } from '../use-save-horse';
import { HorseForm } from './horse-form';
import { savedUrl } from './saved-message';

/** Container for /horses/new. On success, returns to the list with a confirmation. */
export function HorseCreatePage() {
  const router = useRouter();
  const { mutateAsync } = useCreateHorse();
  const t = useTranslations();

  return (
    <>
      <PageHeader title={t.horses.addHorse} description={t.horses.addHorseDescription} />
      <HorseForm
        submitLabel={t.horses.addHorse}
        submittingLabel={t.horses.addingHorse}
        onCancelHref="/horses"
        onSubmit={async (input) => {
          await mutateAsync(input);
          router.push(savedUrl('/horses', 'created'));
        }}
      />
    </>
  );
}
