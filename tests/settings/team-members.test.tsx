import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, within } from '@testing-library/react';
import { TeamMembersPage } from '@/features/settings/components/team-members-page';
import { resetMockTeam } from '@/features/settings/mock/mock-team-service';
import { renderWithProviders } from '../test-utils';
import { navigationState, routerMock } from '../setup';

const LOAD_TIMEOUT = { timeout: 4000 };
const SAVE_TIMEOUT = { timeout: 8000 };

function renderPage(mockScenario?: 'error' | 'empty') {
  navigationState.pathname = '/settings/team';
  window.history.replaceState(
    {},
    '',
    mockScenario ? `/settings/team?mock=${mockScenario}` : '/settings/team',
  );
  return renderWithProviders(<TeamMembersPage />);
}

function present(text: string | RegExp): boolean {
  return screen.queryAllByText(text).length > 0;
}

afterEach(() => {
  resetMockTeam();
  navigationState.pathname = '/dashboard';
  window.history.replaceState({}, '', '/');
});

describe('TeamMembersPage', () => {
  it('shows a skeleton while loading, then the team', async () => {
    renderPage();

    expect(screen.getByText('Loading team members')).toBeInTheDocument();
    await screen.findAllByText('Farida El-Sayed', undefined, LOAD_TIMEOUT);
    expect(screen.queryByText('Loading team members')).toBeNull();
  });

  it('filters by search', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Farida El-Sayed', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search team members/i), 'salma');

    expect(present('Salma Youssef')).toBe(true);
    expect(present('Farida El-Sayed')).toBe(false);
  });

  it('filters by role and status together', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Farida El-Sayed', undefined, LOAD_TIMEOUT);

    await user.selectOptions(screen.getByLabelText(/filter by role/i), 'Trainer');
    expect(present('Salma Youssef')).toBe(false);
    expect(present('Farida El-Sayed')).toBe(true);

    await user.selectOptions(screen.getByLabelText(/filter by status/i), 'invited');
    expect(present('Farida El-Sayed')).toBe(false); // Trainer, but active not invited
  });

  it('distinguishes no results from no team', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Farida El-Sayed', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search team members/i), 'no such person anywhere');
    expect(await screen.findByText('No members match your filters')).toBeInTheDocument();
  });

  it('shows the empty state for a farm with no team yet', async () => {
    renderPage('empty');
    expect(
      await screen.findByText('No team members yet', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
  });

  it('shows the error state', async () => {
    renderPage('error');
    expect(await screen.findByRole('alert', undefined, LOAD_TIMEOUT)).toHaveTextContent(
      "We couldn't load your team",
    );
  });

  it('invites a new member, who then appears in the list as Invited', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Farida El-Sayed', undefined, LOAD_TIMEOUT);

    await user.click(screen.getByRole('button', { name: /invite member/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(screen.getByLabelText(/full name/i), 'Nour Ibrahim');
    await user.type(screen.getByLabelText(/^email/i), 'nour.ibrahim@example.com');
    await user.selectOptions(screen.getByLabelText(/^role/i), 'Worker');
    await user.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() => expect(dialog).not.toBeInTheDocument(), SAVE_TIMEOUT);
    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/settings/team?saved=invited'),
      SAVE_TIMEOUT,
    );

    await user.type(screen.getByLabelText(/search team members/i), 'Nour Ibrahim');
    expect(
      (await screen.findAllByText('Nour Ibrahim', undefined, LOAD_TIMEOUT)).length,
    ).toBeGreaterThan(0);
    expect(present('Invited')).toBe(true);
  }, 15000);

  it('rejects an invite with an invalid email', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Farida El-Sayed', undefined, LOAD_TIMEOUT);

    await user.click(screen.getByRole('button', { name: /invite member/i }));
    await screen.findByRole('dialog');
    await user.type(screen.getByLabelText(/full name/i), 'Someone');
    await user.type(screen.getByLabelText(/^email/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /send invitation/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
  });

  it('changes a member role from the detail dialog', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Farida El-Sayed', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search team members/i), 'Farida');
    const rows = await screen.findAllByRole('button', { name: /view/i });
    await user.click(rows[0]!);
    const dialog = await screen.findByRole('dialog');
    await user.selectOptions(screen.getByLabelText(/^role$/i), 'StableManager');
    await user.click(screen.getByRole('button', { name: /save role/i }));

    await waitFor(() => expect(dialog).not.toBeInTheDocument(), SAVE_TIMEOUT);
    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/settings/team?saved=role'),
      SAVE_TIMEOUT,
    );
  }, 15000);

  it('suspends an active member and can reactivate them again', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Farida El-Sayed', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search team members/i), 'Farida');
    await user.click(screen.getByRole('button', { name: /view/i }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: /suspend member/i }));

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/settings/team?saved=suspended'),
      SAVE_TIMEOUT,
    );

    await user.click(screen.getByRole('button', { name: /view/i }));
    const reopenedDialog = await screen.findByRole('dialog');
    expect(within(reopenedDialog).getByText('Suspended')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reactivate member/i }));

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/settings/team?saved=reactivated'),
      SAVE_TIMEOUT,
    );
  }, 20000);

  it('removes a member after confirming', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Farida El-Sayed', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search team members/i), 'Karim Abdallah');
    await user.click(await screen.findByRole('button', { name: /view/i }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: /remove member/i }));

    const confirmDialog = await screen.findByRole('dialog');
    expect(confirmDialog).toHaveTextContent(/remove karim abdallah from this farm/i);
    await user.click(screen.getByRole('button', { name: /^remove member$/i }));

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/settings/team?saved=removed'),
      SAVE_TIMEOUT,
    );
  }, 15000);
});
