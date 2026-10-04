import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { LoginForm } from '@/features/auth/components/login-form';
import { renderWithProviders } from '../test-utils';
import { routerMock } from '../setup';

describe('LoginForm', () => {
  it('renders the email and password fields and a submit action', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
  });

  it('reports missing and malformed values instead of submitting', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/enter your email address/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your password/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    await user.type(screen.getByLabelText(/^password/i), 'somepassword1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('shows a loading state and then navigates to the dashboard', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'owner@stable.test');
    await user.type(screen.getByLabelText(/^password/i), 'password1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('button', { name: /signing in/i })).toBeDisabled();
    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/dashboard'), {
      timeout: 3000,
    });
  });

  it('surfaces a form-level error when the service rejects the credentials', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'locked@smarthorse.test');
    await user.type(screen.getByLabelText(/^password/i), 'password1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent(/locked/i);
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it('links to the forgot-password screen', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByRole('link', { name: /forgot your password/i })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });
});
