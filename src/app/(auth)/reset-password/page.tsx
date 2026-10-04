import type { Metadata } from 'next';
import { ResetPasswordScreen } from '@/features/auth/components/reset-password-screen';

export const metadata: Metadata = { title: 'Set a new password' };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return <ResetPasswordScreen token={token ?? ''} />;
}
