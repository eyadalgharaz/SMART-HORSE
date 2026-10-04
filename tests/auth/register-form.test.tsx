import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { RegisterForm } from '@/features/auth/components/register-form';
import { renderWithProviders } from '../test-utils';
import { routerMock } from '../setup';

describe('RegisterForm', () => {
  it('renders every field in the user model, including a role for each official role', () => {
    renderWithProviders(<RegisterForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

    expect(screen.getByRole('radiogroup', { name: /role/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /farm owner/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /stable manager/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^trainer/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^worker/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^doctor/i })).toBeInTheDocument();
    // The banned internal role names must never reach the user-facing form
    // (word-boundary match, so the legitimate "grooming" task word is fine).
    expect(screen.queryByText(/\bgroom\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bveterinarian\b/i)).not.toBeInTheDocument();
  });

  it('rejects a confirmation that does not match the password', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText(/full name/i), 'Layla Hassan');
    await user.type(screen.getByLabelText(/email/i), 'layla@stable.test');
    await user.type(screen.getByLabelText(/^password/i), 'password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'password2');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('enforces the password strength rules', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText(/full name/i), 'Layla Hassan');
    await user.type(screen.getByLabelText(/email/i), 'layla@stable.test');
    await user.type(screen.getByLabelText(/^password/i), 'short');
    await user.type(screen.getByLabelText(/confirm password/i), 'short');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/use at least 8 characters/i)).toBeInTheDocument();
  });

  it('requires a role to be chosen before creating the account', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText(/full name/i), 'Layla Hassan');
    await user.type(screen.getByLabelText(/email/i), 'layla@stable.test');
    await user.type(screen.getByLabelText(/^password/i), 'password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'password1');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/choose your role/i)).toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('lets a role be selected with a clear, keyboard-reachable selected state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    const trainerOption = screen.getByRole('radio', { name: /^trainer/i });
    expect(trainerOption).not.toBeChecked();

    await user.click(trainerOption);
    expect(trainerOption).toBeChecked();

    // Native radios keep a single selection per group.
    await user.click(screen.getByRole('radio', { name: /^worker/i }));
    expect(trainerOption).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /^worker/i })).toBeChecked();
  });

  it('creates the account, preserves the selected role, and moves to the dashboard', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterForm />);

    await user.type(screen.getByLabelText(/full name/i), 'Layla Hassan');
    await user.type(screen.getByLabelText(/email/i), 'layla@stable.test');
    await user.type(screen.getByLabelText(/^password/i), 'password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'password1');
    await user.click(screen.getByRole('radio', { name: /stable manager/i }));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/dashboard'), {
      timeout: 3000,
    });

    const stored = JSON.parse(window.localStorage.getItem('smarthorse.mock-session')!);
    expect(stored.user.farmRole).toBe('StableManager');
    expect(stored.user.fullName).toBe('Layla Hassan');
  });
});
