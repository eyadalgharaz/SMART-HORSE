import { afterEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { HorseProfilePage } from '@/features/horses/components/horse-profile-page';
import { resetMockHorses } from '@/features/horses/mock/mock-horse-service';
import { renderWithProviders } from '../test-utils';

const LOAD_TIMEOUT = { timeout: 4000 };

afterEach(() => {
  resetMockHorses();
});

describe('HorseProfilePage', () => {
  it('renders the correct horse data', async () => {
    renderWithProviders(<HorseProfilePage horseId="luna" />);

    expect(await screen.findByRole('heading', { name: 'Luna' }, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.getAllByText('Arabian').length).toBeGreaterThan(0);
    expect(screen.getByText('AHA-284193')).toBeInTheDocument();
    expect(screen.getByText('Ahmed Hassan')).toBeInTheDocument();
  });

  it('shows "Not provided" for identification fields left blank', async () => {
    // Sultan has no microchip on file.
    renderWithProviders(<HorseProfilePage horseId="sultan" />);

    await screen.findByRole('heading', { name: 'Sultan' }, LOAD_TIMEOUT);
    expect(screen.getAllByText('Not provided').length).toBeGreaterThan(0);
    expect(screen.queryByText('null')).toBeNull();
    expect(screen.queryByText('undefined')).toBeNull();
  });

  it('renders a not-found state for an invalid horse id', async () => {
    renderWithProviders(<HorseProfilePage horseId="does-not-exist" />);

    expect(await screen.findByText('Horse not found', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
    for (const link of screen.getAllByRole('link', { name: /back to horses/i })) {
      expect(link).toHaveAttribute('href', '/horses');
    }
  });

  it('offers an edit link to the correct horse', async () => {
    renderWithProviders(<HorseProfilePage horseId="luna" />);

    await screen.findByRole('heading', { name: 'Luna' }, LOAD_TIMEOUT);
    expect(screen.getByRole('link', { name: /edit horse/i })).toHaveAttribute(
      'href',
      '/horses/luna/edit',
    );
  });

  it('links back to the horse list', async () => {
    renderWithProviders(<HorseProfilePage horseId="luna" />);

    expect(screen.getByRole('link', { name: /back to horses/i })).toHaveAttribute(
      'href',
      '/horses',
    );
  });
});
