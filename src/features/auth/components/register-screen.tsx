'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n';
import { AuthCard } from './auth-card';
import { RegisterForm } from './register-form';

export function RegisterScreen() {
  const t = useTranslations();

  return (
    <AuthCard
      title={t.auth.register.title}
      description={t.auth.register.description}
      maxWidth="max-w-lg"
      footer={
        <>
          {t.auth.register.alreadyHaveAccount}{' '}
          <Link href="/login" className="text-pasture-600 underline underline-offset-2">
            {t.auth.register.signIn}
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
