import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { MedicalCreatePage } from '@/features/medical/components/medical-create-page';
import { MedicalEditPage } from '@/features/medical/components/medical-edit-page';
import { HorseMedicalPage } from '@/features/medical/components/horse-medical-page';
import { resetMockHorses } from '@/features/horses/mock/mock-horse-service';
import { resetMockMedical } from '@/features/medical/mock/mock-medical-service';
import { renderWithProviders } from '../test-utils';
import { routerMock } from '../setup';

const LOAD_TIMEOUT = { timeout: 4000 };
const SAVE_TIMEOUT = { timeout: 4000 };

/** Today and a day in the past, as a date input expects them. */
function dateInput(offset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

afterEach(() => {
  resetMockHorses();
  resetMockMedical();
});

describe('MedicalCreatePage (Add medical record)', () => {
  it('renders the form sections for the right horse', async () => {
    renderWithProviders(<MedicalCreatePage horseId="luna" />);

    expect(
      await screen.findByRole('heading', { name: 'Basic information' }, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Clinical information' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Follow-up' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Attachments' })).toBeInTheDocument();
    expect(screen.getByText(/this record belongs to luna/i)).toBeInTheDocument();
  });

  it('rejects submission when the title is missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MedicalCreatePage horseId="luna" />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.click(screen.getByRole('button', { name: /save record/i }));

    expect(await screen.findByText(/enter a short title/i)).toBeInTheDocument();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('rejects a past date on a scheduled record', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MedicalCreatePage horseId="luna" />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/^title/i), 'Follow-up visit');
    await user.selectOptions(screen.getByLabelText(/^status/i), 'scheduled');
    await user.clear(screen.getByLabelText(/^date/i));
    await user.type(screen.getByLabelText(/^date/i), dateInput(-3));
    await user.click(screen.getByRole('button', { name: /save record/i }));

    expect(
      await screen.findByText(/a scheduled record needs a date of today or later/i),
    ).toBeInTheDocument();
  });

  it('rejects a future date on a record that has already happened', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MedicalCreatePage horseId="luna" />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/^title/i), 'Routine examination');
    await user.clear(screen.getByLabelText(/^date/i));
    await user.type(screen.getByLabelText(/^date/i), dateInput(5));
    await user.click(screen.getByRole('button', { name: /save record/i }));

    expect(await screen.findByText(/can't be dated in the future/i)).toBeInTheDocument();
  });

  it('requires the vaccine name once the record type is Vaccination', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MedicalCreatePage horseId="luna" />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    expect(screen.queryByLabelText(/^vaccine/i)).toBeNull();

    await user.selectOptions(screen.getByLabelText(/record type/i), 'vaccination');
    expect(screen.getByLabelText(/^vaccine/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^title/i), 'Influenza booster');
    await user.click(screen.getByRole('button', { name: /save record/i }));

    expect(await screen.findByText('Enter the vaccine name.')).toBeInTheDocument();
  });

  it('rejects a follow-up date before the record date', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MedicalCreatePage horseId="luna" />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/^title/i), 'Lameness examination');
    await user.clear(screen.getByLabelText(/^date/i));
    await user.type(screen.getByLabelText(/^date/i), dateInput(-2));
    await user.type(screen.getByLabelText(/follow-up date/i), dateInput(-10));
    await user.click(screen.getByRole('button', { name: /save record/i }));

    expect(await screen.findByText(/can't be before the record date/i)).toBeInTheDocument();
  });

  it('saves a valid record and returns to the horse’s medical history', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MedicalCreatePage horseId="luna" />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/^title/i), 'Lameness examination');
    await user.type(screen.getByLabelText(/veterinarian/i), 'Dr. Sara Nabil');
    await user.click(screen.getByRole('button', { name: /save record/i }));

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/medical/horses/luna?saved=created'),
      SAVE_TIMEOUT,
    );

    // The mock store now holds the record; the horse's timeline shows it.
    renderWithProviders(<HorseMedicalPage horseId="luna" />);
    expect(
      await screen.findByText('Lameness examination', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
  });

  it('cancel returns to the horse’s medical history without saving', async () => {
    renderWithProviders(<MedicalCreatePage horseId="luna" />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/medical/horses/luna',
    );
  });

  it('shows a not-found state for an unknown horse instead of an empty form', async () => {
    renderWithProviders(<MedicalCreatePage horseId="does-not-exist" />);

    expect(await screen.findByText('Horse not found', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^title/i)).toBeNull();
  });
});

describe('MedicalEditPage (Edit medical record)', () => {
  it('pre-populates the form from the existing record', async () => {
    renderWithProviders(<MedicalEditPage horseId="storm" recordId="mr-006" />);

    expect(
      await screen.findByDisplayValue('Suspensory strain, right foreleg', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dr. Ahmed Samir')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Mild strain of the right foreleg suspensory branch.'),
    ).toBeInTheDocument();
    // Its two attachments come back with it.
    expect(screen.getByText('ultrasound-report-storm.pdf')).toBeInTheDocument();
  });

  it('uses the same validation as the create form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MedicalEditPage horseId="storm" recordId="mr-006" />);

    const title = await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.clear(title);
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/enter a short title/i)).toBeInTheDocument();
  });

  it('saves an edit, and the timeline reflects the change', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MedicalEditPage horseId="storm" recordId="mr-006" />);

    const title = await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.clear(title);
    await user.type(title, 'Suspensory strain, reassessed');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/medical/horses/storm?saved=updated'),
      SAVE_TIMEOUT,
    );

    renderWithProviders(<HorseMedicalPage horseId="storm" />);
    expect(
      await screen.findByText('Suspensory strain, reassessed', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown record id', async () => {
    renderWithProviders(<MedicalEditPage horseId="storm" recordId="mr-does-not-exist" />);

    expect(
      await screen.findByText('Medical record not found', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/^title/i)).toBeNull();
  });

  it('refuses to edit a record that belongs to another horse', async () => {
    // mr-006 is Storm's record, opened under Luna's URL.
    renderWithProviders(<MedicalEditPage horseId="luna" recordId="mr-006" />);

    expect(
      await screen.findByText('Medical record not found', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
  });
});
