import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { HorseCreatePage } from '@/features/horses/components/horse-create-page';
import { resetMockHorses } from '@/features/horses/mock/mock-horse-service';
import { renderWithProviders } from '../test-utils';
import { routerMock } from '../setup';

async function fillMinimumValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^name/i), 'Comet');
  await user.type(screen.getByLabelText(/^breed/i), 'Appaloosa');
  await user.type(screen.getByLabelText(/^color/i), 'Bay');
  await user.type(screen.getByLabelText(/birth date/i), '2020-05-01');
}

afterEach(() => {
  resetMockHorses();
});

describe('HorseCreatePage (Add horse)', () => {
  it('renders the form sections', () => {
    renderWithProviders(<HorseCreatePage />);

    expect(screen.getByRole('heading', { name: 'Basic information' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Identification' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ownership' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Photo' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
  });

  it('rejects submission with required fields missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HorseCreatePage />);

    await user.click(screen.getByRole('button', { name: /add horse/i }));

    expect(await screen.findByText(/enter the horse.s name/i)).toBeInTheDocument();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('rejects a microchip number that is not 15 digits', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HorseCreatePage />);

    await fillMinimumValidForm(user);
    await user.type(screen.getByLabelText(/microchip number/i), '12345');
    await user.click(screen.getByRole('button', { name: /add horse/i }));

    expect(await screen.findByText('A microchip number is 15 digits.')).toBeInTheDocument();
  });

  it('adds a horse to mock state on valid submission and confirms it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HorseCreatePage />);

    await fillMinimumValidForm(user);
    await user.click(screen.getByRole('button', { name: /add horse/i }));

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/horses?saved=created'), {
      timeout: 4000,
    });
  });

  it('cancel returns to the horse list without saving', () => {
    renderWithProviders(<HorseCreatePage />);

    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute('href', '/horses');
  });
});
