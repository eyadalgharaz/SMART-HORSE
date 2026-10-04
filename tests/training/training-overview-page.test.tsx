import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { TrainingOverviewPage } from '@/features/training/components/training-overview-page';
import { resetMockTraining } from '@/features/training/mock/mock-training-service';
import { renderWithProviders } from '../test-utils';

// jsdom does not evaluate the `lg:` breakpoint that toggles between the table
// and the card list, so both render at once. Every session query below uses
// the *All* variant and checks for at least one match rather than asserting
// there is exactly one, which would be a false failure caused only by the
// test environment, not the component.
const LOAD_TIMEOUT = { timeout: 4000 };

function renderPage(mockScenario?: 'error' | 'empty') {
  window.history.replaceState(
    {},
    '',
    mockScenario ? `/training?mock=${mockScenario}` : '/training',
  );
  return renderWithProviders(<TrainingOverviewPage />);
}

function present(text: string | RegExp): boolean {
  return screen.queryAllByText(text).length > 0;
}

function sessionCount(): HTMLElement {
  return screen.getAllByRole('status').find((node) => /sessions?/.test(node.textContent ?? ''))!;
}

afterEach(() => {
  resetMockTraining();
  window.history.replaceState({}, '', '/');
});

describe('TrainingOverviewPage', () => {
  it('shows a skeleton while loading, then the sessions', async () => {
    renderPage();

    expect(screen.getByText('Loading training sessions')).toBeInTheDocument();
    await screen.findAllByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT);
    expect(screen.queryByText('Loading training sessions')).toBeNull();
  });

  it('renders sessions from the mock service with a total count', async () => {
    renderPage();
    await screen.findAllByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT);

    expect(sessionCount()).toHaveTextContent(/\d+ sessions/);
  });

  it('shows the farm training summary', async () => {
    renderPage();
    await screen.findAllByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT);

    expect(screen.getByText('Active training programs')).toBeInTheDocument();
    expect(screen.getByText('Sessions this week')).toBeInTheDocument();
    expect(screen.getByText('Completed sessions')).toBeInTheDocument();
    expect(screen.getByText('Horses in training')).toBeInTheDocument();
  });

  it('filters the list as the user searches', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search training sessions/i), 'Sprint intervals');

    expect(await screen.findByText(/showing \d+ of/i)).toBeInTheDocument();
    expect(present('Sprint intervals, 200 m sets')).toBe(true);
    expect(present('Steady-state trail conditioning')).toBe(false);
  });

  it('filters by horse and by training type', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT);

    await user.selectOptions(screen.getByLabelText(/filter by horse/i), 'storm');
    expect(present('Sprint intervals, 200 m sets')).toBe(true);
    expect(present('Steady-state trail conditioning')).toBe(false);

    await user.selectOptions(screen.getByLabelText(/filter by training type/i), 'recovery');
    expect(present('Sprint intervals, 200 m sets')).toBe(false);
    expect(present('Post-drill cooldown hack')).toBe(true);
  });

  it('combines filters, and clearing them restores the full list', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT);

    await user.selectOptions(screen.getByLabelText(/filter by horse/i), 'luna');
    await user.selectOptions(screen.getByLabelText(/filter by status/i), 'scheduled');

    expect(present('Easy hack, recovery day')).toBe(true);
    expect(present('Steady-state trail conditioning')).toBe(false); // Luna, but completed

    await user.click(screen.getAllByRole('button', { name: /clear filters/i })[0]!);
    expect(sessionCount()).toHaveTextContent(/^\d+ sessions$/);
    expect(present('Steady-state trail conditioning')).toBe(true);
  });

  it('distinguishes no results from no data', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search training sessions/i), 'no such session anywhere');

    expect(await screen.findByText('No sessions match your search')).toBeInTheDocument();
    expect(screen.queryByText('No training sessions yet')).toBeNull();
  });

  it('shows the empty state for a farm with no training data', async () => {
    renderPage('empty');

    expect(
      await screen.findByText('No training sessions yet', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.queryByText('No sessions match your search')).toBeNull();
  });

  it('shows the error state and recovers on retry', async () => {
    const user = userEvent.setup();
    renderPage('error');

    expect(await screen.findByRole('alert', undefined, LOAD_TIMEOUT)).toHaveTextContent(
      "We couldn't load your training data",
    );

    window.history.replaceState({}, '', '/training');
    await user.click(screen.getByRole('button', { name: /try again/i }));

    await screen.findAllByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the training programs on the programs tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT);

    await user.click(screen.getByRole('tab', { name: 'Programs' }));

    expect(await screen.findByText('Endurance Base Building')).toBeInTheDocument();
    expect(present('Racing Conditioning')).toBe(true);
  });

  it('lists upcoming sessions on the upcoming tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT);

    await user.click(screen.getByRole('tab', { name: 'Upcoming' }));

    expect(present('Easy hack, recovery day')).toBe(true);
  });

  it('links each session row to its edit page', async () => {
    renderPage();
    await screen.findAllByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT);

    const editLinks = screen.getAllByRole('link', { name: /edit.*for luna/i });
    expect(editLinks.length).toBeGreaterThan(0);
    expect(editLinks[0]).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/training\/horses\/luna\/edit\//),
    );
  });
});
