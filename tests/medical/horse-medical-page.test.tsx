import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { HorseMedicalPage } from '@/features/medical/components/horse-medical-page';
import { resetMockHorses } from '@/features/horses/mock/mock-horse-service';
import { resetMockMedical } from '@/features/medical/mock/mock-medical-service';
import { renderWithProviders } from '../test-utils';

const LOAD_TIMEOUT = { timeout: 4000 };

afterEach(() => {
  resetMockHorses();
  resetMockMedical();
});

describe('HorseMedicalPage', () => {
  it('shows the horse identity and links back to its Horses profile', async () => {
    renderWithProviders(<HorseMedicalPage horseId="storm" />);

    expect(await screen.findByRole('heading', { name: 'Storm' }, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.getByText('Thoroughbred')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view horse profile/i })).toHaveAttribute(
      'href',
      '/horses/storm',
    );
    expect(screen.getAllByRole('link', { name: /add record/i })[0]).toHaveAttribute(
      'href',
      '/medical/horses/storm/new',
    );
  });

  it('renders that horse’s medical history as a timeline, and no other horse’s', async () => {
    renderWithProviders(<HorseMedicalPage horseId="storm" />);

    expect(
      await screen.findByText('Suspensory strain, right foreleg', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.getByText('Rehabilitation programme')).toBeInTheDocument();
    // Luna's records must not leak onto Storm's page.
    expect(screen.queryByText('Routine health examination')).toBeNull();
  });

  it('groups the timeline under a year heading', async () => {
    renderWithProviders(<HorseMedicalPage horseId="storm" />);

    await screen.findByText('Suspensory strain, right foreleg', undefined, LOAD_TIMEOUT);
    const year = String(new Date().getFullYear());
    expect(screen.getByRole('heading', { name: year })).toBeInTheDocument();
  });

  it('shows the health status and health summary facts', async () => {
    renderWithProviders(<HorseMedicalPage horseId="storm" />);

    await screen.findByText('Suspensory strain, right foreleg', undefined, LOAD_TIMEOUT);
    expect(screen.getByText('Recovering')).toBeInTheDocument();
    expect(screen.getByText('Last vet visit')).toBeInTheDocument();
    expect(screen.getByText('Next vaccination')).toBeInTheDocument();
    expect(screen.getByText('Open follow-ups')).toBeInTheDocument();
  });

  it('opens a timeline entry in the detail dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HorseMedicalPage horseId="storm" />);

    await screen.findByText('Suspensory strain, right foreleg', undefined, LOAD_TIMEOUT);
    await user.click(screen.getByRole('button', { name: /suspensory strain/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/phenylbutazone/i)).toBeInTheDocument();
    // The mock record carries two files; their names are listed.
    expect(within(dialog).getByText('ultrasound-report-storm.pdf')).toBeInTheDocument();
  });

  it('shows a per-horse empty state for a horse with no records', async () => {
    // Maverick exists in Horse Management but has no medical history.
    renderWithProviders(<HorseMedicalPage horseId="maverick" />);

    expect(
      await screen.findByText('No medical records found', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Maverick' })).toBeInTheDocument();
  });

  it('renders a not-found state for an unknown horse id', async () => {
    renderWithProviders(<HorseMedicalPage horseId="does-not-exist" />);

    expect(await screen.findByText('Horse not found', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.queryByText('Medical timeline')).toBeNull();
  });
});
