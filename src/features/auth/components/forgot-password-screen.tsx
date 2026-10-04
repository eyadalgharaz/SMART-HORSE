'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n';
import { AuthCard } from './auth-card';
import { ForgotPasswordForm } from './forgot-password-form';

export function ForgotPasswordScreen() {
  const t = useTranslations();

  return (
    <AuthCard
      title={t.auth.forgotPassword.title}
      description={t.auth.forgotPassword.description}
      footer={
        <Link href="/login" className="text-pasture-600 underline underline-offset-2">
          {t.auth.forgotPassword.backToSignIn}
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
