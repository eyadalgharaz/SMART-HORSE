import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { TrainingCreatePage } from '@/features/training/components/training-create-page';
import { TrainingEditPage } from '@/features/training/components/training-edit-page';
import { HorseTrainingPage } from '@/features/training/components/horse-training-page';
import { resetMockHorses } from '@/features/horses/mock/mock-horse-service';
import { resetMockTraining } from '@/features/training/mock/mock-training-service';
import { renderWithProviders } from '../test-utils';
import { routerMock } from '../setup';

const LOAD_TIMEOUT = { timeout: 4000 };
const SAVE_TIMEOUT = { timeout: 4000 };

/** Today and a day in the past/future, as a date input expects them. */
function dateInput(offset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

afterEach(() => {
  resetMockHorses();
  resetMockTraining();
});

describe('TrainingCreatePage (Add training session)', () => {
  it('renders the form sections for the right horse', async () => {
    renderWithProviders(<TrainingCreatePage horseId="luna" />);

    expect(
      await screen.findByRole('heading', { name: 'Session information' }, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Performance' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.getByText(/this session belongs to luna/i)).toBeInTheDocument();
  });

  it('rejects submission when the title is missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TrainingCreatePage horseId="luna" />);

    await screen.findByLabelText(/session title/i, undefined, LOAD_TIMEOUT);
    await user.selectOptions(screen.getByLabelText(/^trainer\s*\*?$/i), 'trainer-farida');
    await user.click(screen.getByRole('button', { name: /save session/i }));

    expect(await screen.findByText(/enter a short title/i)).toBeInTheDocument();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('rejects a past date on a scheduled session', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TrainingCreatePage horseId="luna" />);

    await screen.findByLabelText(/session title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/session title/i), 'Follow-up conditioning');
    await user.selectOptions(screen.getByLabelText(/^status/i), 'scheduled');
    await user.clear(screen.getByLabelText(/^date/i));
    await user.type(screen.getByLabelText(/^date/i), dateInput(-3));
    await user.selectOptions(screen.getByLabelText(/^trainer\s*\*?$/i), 'trainer-farida');
    await user.click(screen.getByRole('button', { name: /save session/i }));

    expect(
      await screen.findByText(/a scheduled session needs a date of today or later/i),
    ).toBeInTheDocument();
  });

  it('rejects a future date on a completed session', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TrainingCreatePage horseId="luna" />);

    await screen.findByLabelText(/session title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/session title/i), 'Recovery hack');
    await user.selectOptions(screen.getByLabelText(/^status/i), 'completed');
    await user.clear(screen.getByLabelText(/^date/i));
    await user.type(screen.getByLabelText(/^date/i), dateInput(5));
    await user.selectOptions(screen.getByLabelText(/^trainer\s*\*?$/i), 'trainer-farida');
    await user.click(screen.getByRole('button', { name: /save session/i }));

    expect(await screen.findByText(/can't be dated in the future/i)).toBeInTheDocument();
  });

  it('rejects a maximum speed lower than the average speed', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TrainingCreatePage horseId="luna" />);

    await screen.findByLabelText(/session title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/session title/i), 'Interval set');
    await user.selectOptions(screen.getByLabelText(/^trainer\s*\*?$/i), 'trainer-farida');
    await user.type(screen.getByLabelText(/average speed/i), '20');
    await user.type(screen.getByLabelText(/maximum speed/i), '10');
    await user.click(screen.getByRole('button', { name: /save session/i }));

    expect(
      await screen.findByText(/maximum speed can't be lower than the average speed/i),
    ).toBeInTheDocument();
  });

  it('rejects a non-numeric or out-of-range duration', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TrainingCreatePage horseId="luna" />);

    await screen.findByLabelText(/session title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/session title/i), 'Odd duration test');
    await user.selectOptions(screen.getByLabelText(/^trainer\s*\*?$/i), 'trainer-farida');
    await user.clear(screen.getByLabelText(/duration/i));
    await user.type(screen.getByLabelText(/duration/i), '1');
    await user.click(screen.getByRole('button', { name: /save session/i }));

    expect(await screen.findByText(/duration must be between/i)).toBeInTheDocument();
  });

  it('saves a valid session and returns to the horse’s training profile', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TrainingCreatePage horseId="luna" />);

    await screen.findByLabelText(/session title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/session title/i), 'Evening schooling session');
    await user.selectOptions(screen.getByLabelText(/^trainer\s*\*?$/i), 'trainer-farida');
    await user.click(screen.getByRole('button', { name: /save session/i }));

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/training/horses/luna?saved=created'),
      SAVE_TIMEOUT,
    );

    // The mock store now holds the session; the horse's timeline (and its
    // "Last session" summary fact) both reference it, so more than one
    // match is expected here.
    renderWithProviders(<HorseTrainingPage horseId="luna" />);
    expect(
      (await screen.findAllByText('Evening schooling session', undefined, LOAD_TIMEOUT)).length,
    ).toBeGreaterThan(0);
  }, 15000);

  it('cancel returns to the horse’s training profile without saving', async () => {
    renderWithProviders(<TrainingCreatePage horseId="luna" />);

    await screen.findByLabelText(/session title/i, undefined, LOAD_TIMEOUT);
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/training/horses/luna',
    );
  });

  it('shows a not-found state for an unknown horse instead of an empty form', async () => {
    renderWithProviders(<TrainingCreatePage horseId="does-not-exist" />);

    expect(await screen.findByText('Horse not found', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.queryByLabelText(/session title/i)).toBeNull();
  });
});

describe('TrainingEditPage (Edit training session)', () => {
  it('pre-populates the form from the existing session', async () => {
    renderWithProviders(<TrainingEditPage horseId="storm" sessionId="ts-006" />);

    expect(
      await screen.findByDisplayValue('Sprint intervals, 200 m sets', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('4.2')).toBeInTheDocument();
  });

  it('uses the same validation as the create form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TrainingEditPage horseId="storm" sessionId="ts-006" />);

    const title = await screen.findByLabelText(/session title/i, undefined, LOAD_TIMEOUT);
    await user.clear(title);
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/enter a short title/i)).toBeInTheDocument();
  });

  it('saves an edit, and the timeline reflects the change', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TrainingEditPage horseId="storm" sessionId="ts-006" />);

    const title = await screen.findByLabelText(/session title/i, undefined, LOAD_TIMEOUT);
    await user.clear(title);
    await user.type(title, 'Sprint intervals, reassessed');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/training/horses/storm?saved=updated'),
      SAVE_TIMEOUT,
    );

    renderWithProviders(<HorseTrainingPage horseId="storm" />);
    expect(
      await screen.findByText('Sprint intervals, reassessed', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown session id', async () => {
    renderWithProviders(<TrainingEditPage horseId="storm" sessionId="ts-does-not-exist" />);

    expect(
      await screen.findByText('Training session not found', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/session title/i)).toBeNull();
  });

  it('refuses to edit a session that belongs to another horse', async () => {
    // ts-006 is Storm's session, opened under Luna's URL.
    renderWithProviders(<TrainingEditPage horseId="luna" sessionId="ts-006" />);

    expect(
      await screen.findByText('Training session not found', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
  });
});

describe('HorseTrainingPage', () => {
  it('renders the horse identity band and training summary', async () => {
    renderWithProviders(<HorseTrainingPage horseId="luna" />);

    expect(await screen.findByRole('heading', { name: 'Luna' }, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.getByText('Training summary')).toBeInTheDocument();
    expect(screen.getByText('Total sessions')).toBeInTheDocument();
    expect(screen.getByText('Current program')).toBeInTheDocument();
  });

  it('shows the training timeline for the horse', async () => {
    renderWithProviders(<HorseTrainingPage horseId="luna" />);

    expect(
      await screen.findByText('Steady-state trail conditioning', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown horse', async () => {
    renderWithProviders(<HorseTrainingPage horseId="does-not-exist" />);

    expect(await screen.findByText('Horse not found', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
  });

  it('shows an empty training history for a horse with no sessions', async () => {
    renderWithProviders(<HorseTrainingPage horseId="pearl" />);

    expect(
      await screen.findByText('No training history found', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
  });
});
