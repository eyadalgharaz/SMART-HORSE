import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { FarmOwnerDashboard } from '@/features/dashboards/farm-owner/components/farm-owner-dashboard';
import { StableManagerDashboard } from '@/features/dashboards/stable-manager/components/stable-manager-dashboard';
import { TrainerDashboard } from '@/features/dashboards/trainer/components/trainer-dashboard';
import { WorkerDashboard } from '@/features/dashboards/worker/components/worker-dashboard';
import { DoctorDashboard } from '@/features/dashboards/doctor/components/doctor-dashboard';
import { authService } from '@/features/auth/auth-service';
import { renderWithProviders } from '../test-utils';

describe('role dashboard containers render without crashing', () => {
  it('Farm Owner dashboard renders the shared farm overview', async () => {
    renderWithProviders(<FarmOwnerDashboard />);
    // The shared Phase B overview starts in its loading state.
    expect(await screen.findByText('Loading dashboard')).toBeInTheDocument();
  });

  it('Stable Manager dashboard renders the shared farm overview', async () => {
    renderWithProviders(<StableManagerDashboard />);
    expect(await screen.findByText('Loading dashboard')).toBeInTheDocument();
  });

  it('Trainer dashboard shows its own placeholder, not another role\u2019s', async () => {
    await authService.register({
      fullName: 'Sara Adel',
      email: 'sara.trainer2@stable.test',
      password: 'password1',
      farmRole: 'Trainer',
    });
    renderWithProviders(<TrainerDashboard />);

    expect(await screen.findByRole('heading', { name: 'Trainer Dashboard' })).toBeInTheDocument();
    expect(screen.getByText(/ready for implementation/i)).toBeInTheDocument();
    expect(screen.queryByText(/doctor dashboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/worker dashboard/i)).not.toBeInTheDocument();
  });

  it('Worker dashboard shows its own placeholder', async () => {
    renderWithProviders(<WorkerDashboard />);
    expect(await screen.findByRole('heading', { name: 'Worker Dashboard' })).toBeInTheDocument();
    expect(screen.getByText(/ready for implementation/i)).toBeInTheDocument();
  });

  it('Doctor dashboard shows its own placeholder', async () => {
    renderWithProviders(<DoctorDashboard />);
    expect(await screen.findByRole('heading', { name: 'Doctor Dashboard' })).toBeInTheDocument();
    expect(screen.getByText(/ready for implementation/i)).toBeInTheDocument();
  });
});
