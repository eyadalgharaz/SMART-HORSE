'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n';
import { AuthCard } from './auth-card';
import { LoginForm } from './login-form';

export function LoginScreen() {
  const t = useTranslations();

  return (
    <AuthCard
      title={t.auth.login.title}
      description={t.auth.login.description}
      footer={
        <>
          {t.auth.login.newToSmartHorse}{' '}
          <Link href="/register" className="text-pasture-600 underline underline-offset-2">
            {t.auth.login.createAccount}
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
