import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';
import { DashboardRoleRedirect } from '@/features/dashboards/components/dashboard-role-redirect';
import { authService } from '@/features/auth/auth-service';
import { renderWithProviders } from '../test-utils';
import { routerMock } from '../setup';

describe('DashboardRoleRedirect', () => {
  it('sends a Trainer to the Trainer dashboard', async () => {
    await authService.register({
      fullName: 'Sara Adel',
      email: 'sara.trainer@stable.test',
      password: 'password1',
      farmRole: 'Trainer',
    });

    renderWithProviders(<DashboardRoleRedirect />);

    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/dashboard/trainer'));
  });

  it('sends a Doctor to the Doctor dashboard', async () => {
    await authService.register({
      fullName: 'Rania Fathy',
      email: 'rania.doctor@stable.test',
      password: 'password1',
      farmRole: 'Doctor',
    });

    renderWithProviders(<DashboardRoleRedirect />);

    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/dashboard/doctor'));
  });

  it('sends every official role to its own dashboard route', async () => {
    const roles = [
      ['FarmOwner', '/dashboard/farm-owner'],
      ['StableManager', '/dashboard/stable-manager'],
      ['Trainer', '/dashboard/trainer'],
      ['Worker', '/dashboard/worker'],
      ['Doctor', '/dashboard/doctor'],
    ] as const;

    for (const [farmRole, expectedPath] of roles) {
      window.localStorage.clear();
      routerMock.replace.mockClear();

      await authService.register({
        fullName: `${farmRole} Person`,
        email: `${farmRole.toLowerCase()}@stable.test`,
        password: 'password1',
        farmRole,
      });

      const { unmount } = renderWithProviders(<DashboardRoleRedirect />);
      await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith(expectedPath));
      unmount();
    }
  });

  it('falls back safely to the Farm Owner dashboard when no role is known yet', async () => {
    // No session at all — an unknown/absent role must not crash the redirect.
    renderWithProviders(<DashboardRoleRedirect />);

    await waitFor(() => expect(routerMock.replace).toHaveBeenCalledWith('/dashboard/farm-owner'));
  });

  it('preserves the ?mock= review switch across the redirect', async () => {
    window.history.replaceState({}, '', '/dashboard?mock=slow');
    await authService.register({
      fullName: 'Omar Nabil',
      email: 'omar.owner@stable.test',
      password: 'password1',
      farmRole: 'FarmOwner',
    });

    renderWithProviders(<DashboardRoleRedirect />);

    await waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith('/dashboard/farm-owner?mock=slow'),
    );
  });
});
