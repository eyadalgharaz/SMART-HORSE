import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, within } from '@testing-library/react';
import { AppShell } from '@/components/layout/app-shell';
import { authService } from '@/features/auth/auth-service';
import { navItems } from '@/config/navigation';
import { en } from '@/i18n/dictionaries/en';
import { renderWithProviders } from '../test-utils';
import { navigationState } from '../setup';

async function renderShell() {
  await authService.login({ email: 'owner@stable.test', password: 'password1' });
  return renderWithProviders(
    <AppShell>
      <p>Content area</p>
    </AppShell>,
  );
}

describe('AppShell', () => {
  it('renders the topbar, navigation and content area', async () => {
    await renderShell();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Content area')).toBeInTheDocument();

    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0]!;
    for (const item of navItems) {
      expect(within(nav).getByRole('link', { name: en.shell.nav[item.key] })).toHaveAttribute(
        'href',
        item.href,
      );
    }
  });

  it('marks the current route as the active navigation item', async () => {
    navigationState.pathname = '/horses';
    await renderShell();

    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0]!;
    expect(within(nav).getByRole('link', { name: 'Horses' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('exposes a menu button that opens the mobile navigation drawer', async () => {
    const user = userEvent.setup();
    await renderShell();

    const drawer = document.getElementById('sh-sidebar')!;
    expect(drawer).toHaveAttribute('aria-hidden', 'true');

    await user.click(screen.getByRole('button', { name: /open navigation/i }));
    expect(drawer).not.toHaveAttribute('aria-hidden', 'true');

    await user.click(within(drawer).getByRole('button', { name: /close navigation/i }));
    expect(drawer).toHaveAttribute('aria-hidden', 'true');
  });

  it('takes the closed mobile drawer out of the keyboard tab order', async () => {
    const user = userEvent.setup();
    await renderShell();

    const drawer = document.getElementById('sh-sidebar')!;
    expect(drawer).toHaveAttribute('inert');

    await user.click(screen.getByRole('button', { name: /open navigation/i }));
    expect(drawer).not.toHaveAttribute('inert');
  });

  it('shows the signed-in user and a way to sign out', async () => {
    const user = userEvent.setup();
    await renderShell();

    const accountButton = await screen.findByRole('button', { name: /account menu/i });
    await user.click(accountButton);

    const menu = screen.getByRole('menu');
    await waitFor(() => expect(menu).toHaveTextContent('owner@stable.test'));
    expect(within(menu).getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument();
  });

  it('keeps out-of-scope areas out of the navigation', async () => {
    await renderShell();
    const nav = screen.getAllByRole('navigation', { name: 'Main' })[0]!;
    expect(within(nav).queryByRole('link', { name: /marketplace/i })).toBeNull();
  });
});
