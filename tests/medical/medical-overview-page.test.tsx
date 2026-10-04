import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { MedicalOverviewPage } from '@/features/medical/components/medical-overview-page';
import { resetMockMedical } from '@/features/medical/mock/mock-medical-service';
import { renderWithProviders } from '../test-utils';

// jsdom does not evaluate the `lg:` breakpoint that toggles between the table
// and the card list, so both render at once. Every record query below uses the
// *All* variant and checks for at least one match rather than asserting there is
// exactly one, which would be a false failure caused only by the test
// environment, not the component.
const LOAD_TIMEOUT = { timeout: 4000 };

function renderPage(mockScenario?: 'error' | 'empty') {
  window.history.replaceState({}, '', mockScenario ? `/medical?mock=${mockScenario}` : '/medical');
  return renderWithProviders(<MedicalOverviewPage />);
}

function present(text: string | RegExp): boolean {
  return screen.queryAllByText(text).length > 0;
}

function recordCount(): HTMLElement {
  return screen.getAllByRole('status').find((node) => /records?/.test(node.textContent ?? ''))!;
}

afterEach(() => {
  resetMockMedical();
  window.history.replaceState({}, '', '/');
});

describe('MedicalOverviewPage', () => {
  it('shows a skeleton while loading, then the records', async () => {
    renderPage();

    expect(screen.getByText('Loading medical records')).toBeInTheDocument();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);
    expect(screen.queryByText('Loading medical records')).toBeNull();
  });

  it('renders records from the mock service with a total count', async () => {
    renderPage();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);

    expect(recordCount()).toHaveTextContent(/\d+ records/);
  });

  it('shows the farm health summary', async () => {
    renderPage();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);

    expect(screen.getByText('Horses requiring attention')).toBeInTheDocument();
    expect(screen.getByText('Vaccinations due')).toBeInTheDocument();
    expect(screen.getByText('Upcoming vet visits')).toBeInTheDocument();
  });

  it('filters the list as the user searches', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search medical records/i), 'laminitis');

    expect(await screen.findByText(/showing \d+ of/i)).toBeInTheDocument();
    expect(present('Suspected early laminitis')).toBe(true);
    expect(present('Routine health examination')).toBe(false);
  });

  it('searches by veterinarian and by medication', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);

    const search = screen.getByLabelText(/search medical records/i);

    await user.type(search, 'Omar');
    expect(await screen.findByText(/showing \d+ of/i)).toBeInTheDocument();
    expect(present('Hock osteoarthritis')).toBe(true);

    await user.clear(search);
    await user.type(search, 'Firocoxib');
    expect(present('Daily anti-inflammatory course')).toBe(true);
    expect(present('Hock osteoarthritis')).toBe(false);
  });

  it('filters by horse and by record type', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);

    await user.selectOptions(screen.getByLabelText(/filter by horse/i), 'storm');
    expect(present('Suspensory strain, right foreleg')).toBe(true);
    expect(present('Routine health examination')).toBe(false);

    await user.selectOptions(screen.getByLabelText(/filter by record type/i), 'vaccination');
    expect(present('Suspensory strain, right foreleg')).toBe(false);
    expect(present('Equine herpesvirus booster')).toBe(true);
  });

  it('combines filters, and clearing them restores the full list', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);

    await user.selectOptions(screen.getByLabelText(/filter by horse/i), 'duke');
    await user.selectOptions(screen.getByLabelText(/filter by status/i), 'ongoing');

    expect(present('Hock osteoarthritis')).toBe(true);
    expect(present('Senior horse health check')).toBe(false); // Duke, but completed

    await user.click(screen.getAllByRole('button', { name: /clear filters/i })[0]!);
    expect(recordCount()).toHaveTextContent(/^\d+ records$/);
    expect(present('Routine health examination')).toBe(true);
  });

  it('distinguishes no results from no data', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search medical records/i), 'no such record anywhere');

    expect(await screen.findByText('No records match your search')).toBeInTheDocument();
    expect(screen.queryByText('No medical records yet')).toBeNull();
  });

  it('shows the empty state for a farm with no medical data', async () => {
    renderPage('empty');

    expect(
      await screen.findByText('No medical records yet', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.queryByText('No records match your search')).toBeNull();
  });

  it('shows the error state and recovers on retry', async () => {
    const user = userEvent.setup();
    renderPage('error');

    expect(await screen.findByRole('alert', undefined, LOAD_TIMEOUT)).toHaveTextContent(
      "We couldn't load your medical records",
    );

    window.history.replaceState({}, '', '/medical');
    await user.click(screen.getByRole('button', { name: /try again/i }));

    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('opens a record in the detail dialog and closes it again', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);

    await user.click(screen.getAllByRole('button', { name: 'Suspected early laminitis' })[0]!);

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText(/suspected early laminitis, both forefeet/i),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: /edit record/i })).toHaveAttribute(
      'href',
      '/medical/horses/willow/edit/mr-022',
    );

    await user.click(within(dialog).getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows vaccinations with calculated statuses on the vaccinations tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);

    await user.click(screen.getByRole('tab', { name: 'Vaccinations' }));

    expect(await screen.findByText(/\d+ vaccinations/)).toBeInTheDocument();
    expect(present('Equine influenza')).toBe(true);
    expect(present('Overdue')).toBe(true);
  });

  it('filters vaccinations by status', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);

    await user.click(screen.getByRole('tab', { name: 'Vaccinations' }));
    await screen.findByText(/\d+ vaccinations/);

    // West Nile virus is overdue for Duke; Rabies is not due for months.
    expect(present('Rabies')).toBe(true);

    await user.selectOptions(screen.getByLabelText(/filter vaccinations by status/i), 'overdue');

    expect(await screen.findByText(/showing \d+ of \d+ vaccinations/i)).toBeInTheDocument();
    expect(present('West Nile virus')).toBe(true);
    expect(present('Rabies')).toBe(false);
  });

  it('lists upcoming medical events on the upcoming tab', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Routine health examination', undefined, LOAD_TIMEOUT);

    await user.click(screen.getByRole('tab', { name: 'Upcoming' }));

    expect(await screen.findByText('Upcoming medical events')).toBeInTheDocument();
    expect(present('Dental and eye examination')).toBe(true);
  });
});
