import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { SettingsOverviewPage } from '@/features/settings/components/settings-overview-page';
import { FarmProfilePage } from '@/features/settings/components/farm-profile-page';
import { RolesPage } from '@/features/settings/components/roles-page';
import { AccountPage } from '@/features/settings/components/account-page';
import { resetMockFarm } from '@/features/settings/mock/mock-farm-service';
import { resetMockTeam } from '@/features/settings/mock/mock-team-service';
import { resetMockAccount } from '@/features/settings/mock/mock-account-service';
import { resetMockHorses } from '@/features/horses/mock/mock-horse-service';
import { renderWithProviders } from '../test-utils';
import { navigationState } from '../setup';

const LOAD_TIMEOUT = { timeout: 4000 };
const SESSION_KEY = 'smarthorse.mock-session';

function seedSession(
  overrides: Partial<{ fullName: string; email: string; farmRole: string }> = {},
) {
  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      user: {
        id: 'mock-user',
        fullName: 'Jane Owner',
        email: 'jane.owner@greenvalleyfarm.example',
        farmRole: 'FarmOwner',
        ...overrides,
      },
    }),
  );
}

afterEach(() => {
  resetMockFarm();
  resetMockTeam();
  resetMockAccount();
  resetMockHorses();
  navigationState.pathname = '/dashboard';
  window.history.replaceState({}, '', '/');
});

describe('SettingsOverviewPage', () => {
  it('links every card to a real settings route', () => {
    renderWithProviders(<SettingsOverviewPage />);

    expect(screen.getByRole('link', { name: /farm profile/i })).toHaveAttribute(
      'href',
      '/settings/farm',
    );
    expect(screen.getByRole('link', { name: /team members/i })).toHaveAttribute(
      'href',
      '/settings/team',
    );
    expect(screen.getByRole('link', { name: /roles & permissions/i })).toHaveAttribute(
      'href',
      '/settings/roles',
    );
    expect(screen.getByRole('link', { name: /^account/i })).toHaveAttribute(
      'href',
      '/settings/account',
    );
  });
});

describe('FarmProfilePage', () => {
  function render() {
    navigationState.pathname = '/settings/farm';
    return renderWithProviders(<FarmProfilePage />);
  }

  it('renders the farm summary and pre-populated form', async () => {
    render();

    expect(
      await screen.findByDisplayValue('Green Valley Farm', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.getByText('Farm status')).toBeInTheDocument();
    expect(screen.getByText('Total horses')).toBeInTheDocument();
  });

  it('rejects an empty farm name', async () => {
    const user = userEvent.setup();
    render();

    const name = await screen.findByDisplayValue('Green Valley Farm', undefined, LOAD_TIMEOUT);
    await user.clear(name);
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/enter the farm name/i)).toBeInTheDocument();
  });

  it('rejects an invalid email', async () => {
    const user = userEvent.setup();
    render();

    await screen.findByDisplayValue('Green Valley Farm', undefined, LOAD_TIMEOUT);
    const email = screen.getByLabelText(/^email$/i);
    await user.clear(email);
    await user.type(email, 'not-an-email');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });

  it('saves a valid edit and redirects with a saved confirmation param', async () => {
    const user = userEvent.setup();
    render();

    const name = await screen.findByDisplayValue('Green Valley Farm', undefined, LOAD_TIMEOUT);
    await user.clear(name);
    await user.type(name, 'Green Valley Equestrian Farm');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    const { routerMock } = await import('../setup');
    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/settings/farm?saved=farm'),
      LOAD_TIMEOUT,
    );
  });

  it('shows the error state with retry', async () => {
    navigationState.pathname = '/settings/farm';
    window.history.replaceState({}, '', '/settings/farm?mock=error');
    renderWithProviders(<FarmProfilePage />);

    expect(await screen.findByRole('alert', undefined, LOAD_TIMEOUT)).toHaveTextContent(
      "We couldn't load the farm profile",
    );
  });
});

describe('RolesPage', () => {
  it('renders all five existing farm roles with member counts and expandable permissions', async () => {
    const user = userEvent.setup();
    navigationState.pathname = '/settings/roles';
    renderWithProviders(<RolesPage />);

    expect(await screen.findByText('Farm Owner', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.getByText('Stable Manager')).toBeInTheDocument();
    expect(screen.getByText('Trainer')).toBeInTheDocument();
    expect(screen.getByText('Worker')).toBeInTheDocument();
    expect(screen.getByText('Doctor')).toBeInTheDocument();

    const toggles = screen.getAllByRole('button', { name: /show permissions/i });
    await user.click(toggles[0]!);
    expect(screen.getAllByText(/^(Full|Manage|View only|None)$/).length).toBeGreaterThan(0);
  });
});

describe('AccountPage', () => {
  function render() {
    navigationState.pathname = '/settings/account';
    seedSession();
    return renderWithProviders(<AccountPage />);
  }

  it('renders the signed-in profile', async () => {
    render();
    expect(
      await screen.findByDisplayValue('Jane Owner', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane.owner@greenvalleyfarm.example')).toBeInTheDocument();
  });

  it('rejects a new password that does not meet the strength rule', async () => {
    const user = userEvent.setup();
    render();

    await screen.findByDisplayValue('Jane Owner', undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/current password/i), 'oldpassword1');
    await user.type(screen.getByLabelText(/^new password/i), 'short');
    await user.type(screen.getByLabelText(/confirm new password/i), 'short');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText(/use at least 8 characters/i)).toBeInTheDocument();
  });

  it('rejects mismatched password confirmation', async () => {
    const user = userEvent.setup();
    render();

    await screen.findByDisplayValue('Jane Owner', undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/current password/i), 'oldpassword1');
    await user.type(screen.getByLabelText(/^new password/i), 'newpassword1');
    await user.type(screen.getByLabelText(/confirm new password/i), 'newpassword2');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('saves preferences', async () => {
    const user = userEvent.setup();
    render();

    await screen.findByDisplayValue('Jane Owner', undefined, LOAD_TIMEOUT);
    await user.selectOptions(screen.getByLabelText(/^time format$/i), '24h');
    await user.click(screen.getByRole('button', { name: /save preferences/i }));

    const { routerMock } = await import('../setup');
    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/settings/account?saved=preferences'),
      LOAD_TIMEOUT,
    );
  });
});
