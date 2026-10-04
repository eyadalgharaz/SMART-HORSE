import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { HorseEditPage } from '@/features/horses/components/horse-edit-page';
import { HorseProfilePage } from '@/features/horses/components/horse-profile-page';
import { resetMockHorses } from '@/features/horses/mock/mock-horse-service';
import { renderWithProviders } from '../test-utils';
import { routerMock } from '../setup';

const LOAD_TIMEOUT = { timeout: 4000 };

afterEach(() => {
  resetMockHorses();
});

describe('HorseEditPage (Edit horse)', () => {
  it('pre-populates the form with the existing horse data', async () => {
    renderWithProviders(<HorseEditPage horseId="luna" />);

    expect(await screen.findByDisplayValue('Luna', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Arabian')).toBeInTheDocument();
    expect(screen.getByDisplayValue('AHA-284193')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ahmed Hassan')).toBeInTheDocument();
  });

  it('shows a not-found state for an invalid horse id, not an empty form', async () => {
    renderWithProviders(<HorseEditPage horseId="does-not-exist" />);

    expect(await screen.findByText('Horse not found', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^name/i)).toBeNull();
  });

  it('saves an update and returns to the profile, which reflects the change', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HorseEditPage horseId="luna" />);

    await screen.findByDisplayValue('Luna', undefined, LOAD_TIMEOUT);

    const colorField = screen.getByLabelText(/^color/i);
    await user.clear(colorField);
    await user.type(colorField, 'Dapple grey');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/horses/luna?saved=updated'),
      { timeout: 4000 },
    );

    // The mock store now holds the update; the profile shows it.
    renderWithProviders(<HorseProfilePage horseId="luna" />);
    expect(await screen.findByText('Dapple grey', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
  });

  it('cancel returns to the horse profile without saving', async () => {
    renderWithProviders(<HorseEditPage horseId="luna" />);

    await screen.findByDisplayValue('Luna', undefined, LOAD_TIMEOUT);
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute('href', '/horses/luna');
  });
});
