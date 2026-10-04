'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n';
import { AuthCard } from './auth-card';
import { ResetPasswordForm } from './reset-password-form';

export function ResetPasswordScreen({ token }: { token: string }) {
  const t = useTranslations();

  return (
    <AuthCard
      title={t.auth.resetPassword.title}
      description={t.auth.resetPassword.description}
      footer={
        <Link href="/login" className="text-pasture-600 underline underline-offset-2">
          {t.auth.resetPassword.backToSignIn}
        </Link>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
