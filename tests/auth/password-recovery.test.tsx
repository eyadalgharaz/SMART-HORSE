import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { renderWithProviders } from '../test-utils';

describe('ForgotPasswordForm', () => {
  it('renders an email field and a send action', () => {
    renderWithProviders(<ForgotPasswordForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('validates the email before sending', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);

    await user.click(screen.getByRole('button', { name: /send reset link/i }));
    expect(await screen.findByText(/enter your email address/i)).toBeInTheDocument();
  });

  it('confirms that reset instructions were sent', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText(/email/i), 'owner@stable.test');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(
      await screen.findByText(/password reset instructions have been sent/i, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });
});

describe('ResetPasswordForm', () => {
  it('renders both password fields', () => {
    renderWithProviders(<ResetPasswordForm token="token" />);
    expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
  });

  it('rejects a mismatched confirmation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordForm token="token" />);

    await user.type(screen.getByLabelText(/^new password/i), 'password1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'password2');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('confirms success and offers a way back to sign in', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordForm token="token" />);

    await user.type(screen.getByLabelText(/^new password/i), 'password1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'password1');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(
      await screen.findByText(/your password has been updated/i, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to sign in/i })).toHaveAttribute('href', '/login');
  });

  it('reports an expired reset link', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ResetPasswordForm token="expired" />);

    await user.type(screen.getByLabelText(/^new password/i), 'password1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'password1');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent(/expired/i);
  });
});
