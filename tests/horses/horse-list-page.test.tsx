import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { HorseListPage } from '@/features/horses/components/horse-list-page';
import { resetMockHorses } from '@/features/horses/mock/mock-horse-service';
import { STORAGE_KEY } from '@/i18n/locale';
import { renderWithProviders } from '../test-utils';

// jsdom does not evaluate the `lg:` breakpoint that toggles between the table
// and the card list, so both render at once in tests. Every horse name query
// below uses the *All* variant and checks for at least one match instead of
// asserting there is exactly one, which would be a false failure caused only
// by the test environment, not the component.
const LOAD_TIMEOUT = { timeout: 4000 };

function renderList(mockScenario?: 'error' | 'empty') {
  window.history.replaceState({}, '', mockScenario ? `/horses?mock=${mockScenario}` : '/horses');
  return renderWithProviders(<HorseListPage />);
}

function present(name: string): boolean {
  return screen.queryAllByText(name).length > 0;
}

afterEach(() => {
  resetMockHorses();
  window.history.replaceState({}, '', '/');
  window.localStorage.clear();
});

describe('HorseListPage', () => {
  it('shows a skeleton while loading, then the horse list', async () => {
    renderList();

    expect(screen.getByText('Loading horses')).toBeInTheDocument();
    await screen.findAllByText('Luna', undefined, LOAD_TIMEOUT);
    expect(screen.queryByText('Loading horses')).toBeNull();
  });

  it('renders horses from the mock service with a total count', async () => {
    renderList();

    await screen.findAllByText('Luna', undefined, LOAD_TIMEOUT);
    expect(screen.getByRole('status')).toHaveTextContent(/\d+ horses/);
    expect(screen.getAllByRole('link', { name: 'Add horse' })[0]).toHaveAttribute(
      'href',
      '/horses/new',
    );
  });

  it('filters the list as the user searches', async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findAllByText('Luna', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search horses/i), 'Luna');

    expect(await screen.findByText(/showing 1 of/i)).toBeInTheDocument();
    expect(present('Luna')).toBe(true);
    expect(present('Storm')).toBe(false);
  });

  it('filters by breed', async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findAllByText('Luna', undefined, LOAD_TIMEOUT);

    await user.selectOptions(screen.getByLabelText(/filter by breed/i), 'Arabian');

    expect(screen.getByRole('status')).toHaveTextContent(/showing \d+ of/i);
    expect(present('Luna')).toBe(true);
    expect(present('Storm')).toBe(false);
  });

  it('combines multiple filters', async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findAllByText('Luna', undefined, LOAD_TIMEOUT);

    await user.selectOptions(screen.getByLabelText(/filter by gender/i), 'gelding');
    await user.selectOptions(screen.getByLabelText(/filter by status/i), 'active');

    expect(present('Luna')).toBe(false); // Luna is a mare
    expect(present('Duke')).toBe(true); // gelding, active
  });

  it('clears active filters', async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findAllByText('Luna', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search horses/i), 'Luna');
    expect(await screen.findByRole('button', { name: /clear filters/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.getByLabelText(/search horses/i)).toHaveValue('');
    expect(present('Storm')).toBe(true);
  });

  it('shows a dedicated empty state when a search matches nothing', async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findAllByText('Luna', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search horses/i), 'no such horse anywhere');

    expect(await screen.findByText('No horses match your search')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /clear filters/i }).length).toBeGreaterThan(0);
  });

  it('shows the empty state for a farm with no horses', async () => {
    renderList('empty');

    expect(await screen.findByText('No horses yet', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /add horse/i }).length).toBeGreaterThan(0);
  });

  it('shows the error state and recovers on retry', async () => {
    const user = userEvent.setup();
    renderList('error');

    expect(await screen.findByRole('alert', undefined, LOAD_TIMEOUT)).toHaveTextContent(
      "We couldn't load your horses",
    );

    window.history.replaceState({}, '', '/horses');
    await user.click(screen.getByRole('button', { name: /try again/i }));

    await screen.findAllByText('Luna', undefined, LOAD_TIMEOUT);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('HorseListPage in Arabic', () => {
  it('shows real Arabic demo horse names and localized gender/status words, not English leftovers', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'ar');
    renderList();

    // "Luna" in the mock dataset is localized to the Arabic demo name "ليلى" —
    // a real Arabic name, not a transliteration of the English one.
    await screen.findAllByText('ليلى', undefined, LOAD_TIMEOUT);
    expect(present('Luna')).toBe(false);

    // Another couple of the 24-horse roster, to confirm this isn't a single
    // hard-coded special case.
    expect(present('شاهين')).toBe(true); // Shadow
    expect(present('فارس')).toBe(true); // Duke

    // Gender and status words are localized too, in the same table/cards.
    expect(present('فرس')).toBe(true); // Mare
    expect(present('نشط')).toBe(true); // Active
    expect(present('Mare')).toBe(false);
    expect(present('Active')).toBe(false);

    expect(screen.getAllByRole('link', { name: 'إضافة حصان' })[0]).toHaveAttribute(
      'href',
      '/horses/new',
    );
    expect(document.documentElement.dir).toBe('rtl');
  });
});
