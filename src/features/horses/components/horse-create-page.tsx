'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { useCreateHorse } from '../use-save-horse';
import { HorseForm } from './horse-form';
import { savedUrl } from './saved-message';

/** Container for /horses/new. On success, returns to the list with a confirmation. */
export function HorseCreatePage() {
  const router = useRouter();
  const { mutateAsync } = useCreateHorse();

  return (
    <>
      <PageHeader title="Add horse" description="Record a new horse's identity and papers." />
      <HorseForm
        submitLabel="Add horse"
        submittingLabel="Adding horse"
        onCancelHref="/horses"
        onSubmit={async (input) => {
          await mutateAsync(input);
          router.push(savedUrl('/horses', 'created'));
        }}
      />
    </>
  );
}
