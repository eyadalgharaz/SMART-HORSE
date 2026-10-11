import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { DashboardPage } from '@/features/dashboard/components/dashboard-page';
import { authService } from '@/features/auth/auth-service';
import { STORAGE_KEY } from '@/i18n/locale';
import { renderWithProviders } from '../test-utils';

// These tests go through the real container, hook, service seam and mock service.
// The mock's simulated latency is ~700 ms, so waits are given room to finish.
const LOAD_TIMEOUT = { timeout: 4000 };

async function renderDashboard(mockScenario?: 'error' | 'empty') {
  window.history.replaceState(
    {},
    '',
    mockScenario ? `/dashboard?mock=${mockScenario}` : '/dashboard',
  );
  await authService.login({ email: 'ahmed.hassan@greenvalley.test', password: 'password1' });
  return renderWithProviders(<DashboardPage />);
}

afterEach(() => {
  window.history.replaceState({}, '', '/');
  window.localStorage.clear();
});

describe('DashboardPage', () => {
  it('shows a skeleton while loading, not a spinner', async () => {
    await renderDashboard();

    expect(screen.getByText('Loading dashboard')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    // Real content is not on screen yet.
    expect(screen.queryByText('Upcoming tasks')).toBeNull();

    await screen.findByText('Upcoming tasks', undefined, LOAD_TIMEOUT);
    expect(screen.queryByText('Loading dashboard')).toBeNull();
  });

  it('renders the full dashboard from the mock service', async () => {
    await renderDashboard();

    // Header: personalised greeting once the session is known, and the farm.
    expect(
      await screen.findByRole('heading', { name: /good (morning|afternoon|evening), ahmed/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Green Valley Farm', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();

    // Summary cards.
    const summary = within(
      await screen.findByRole('region', { name: 'Farm summary' }, LOAD_TIMEOUT),
    );
    expect(summary.getAllByRole('listitem')).toHaveLength(4);
    expect(summary.getByText('Total horses')).toBeInTheDocument();
    expect(summary.getByText('42')).toBeInTheDocument();

    // Main and secondary sections.
    for (const name of [
      'Horse activity',
      'Upcoming tasks',
      'Health overview',
      'Recent notifications',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Vaccination reminder')).toBeInTheDocument();
  });

  it('keeps a sensible heading structure', async () => {
    await renderDashboard();
    await screen.findByText('Upcoming tasks', undefined, LOAD_TIMEOUT);

    // The page <h1> lives in the topbar (Phase A); everything here is a level-2 heading.
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    const levels = new Set(screen.getAllByRole('heading').map((h) => h.tagName));
    expect(levels).toEqual(new Set(['H2']));
  });

  it('shows the error state and recovers when the user retries', async () => {
    const user = userEvent.setup();
    await renderDashboard('error');

    expect(await screen.findByRole('alert', undefined, LOAD_TIMEOUT)).toHaveTextContent(
      "We couldn't load the dashboard data.",
    );
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.queryByText('Upcoming tasks')).toBeNull();

    // The problem clears (as a restored connection would); Try again then succeeds.
    window.history.replaceState({}, '', '/dashboard');
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByText('Upcoming tasks', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows friendly empty states for a farm with no data', async () => {
    await renderDashboard('empty');

    expect(
      await screen.findAllByText("You're all caught up.", undefined, LOAD_TIMEOUT),
    ).toHaveLength(2);
    expect(screen.getByText('No upcoming tasks')).toBeInTheDocument();
    expect(screen.getByText('No recent notifications')).toBeInTheDocument();
    expect(screen.getByText('No activity in the last 7 days')).toBeInTheDocument();
    expect(screen.getByText('No health items yet')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('DashboardPage in Arabic', () => {
  it('renders every panel in Arabic — including mock data, not just static labels', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'ar');
    await renderDashboard();

    await screen.findByText('المهام القادمة', undefined, LOAD_TIMEOUT);

    // Section headings.
    for (const name of ['نشاط الخيول', 'المهام القادمة', 'الحالة الصحية', 'الإشعارات الأخيرة']) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }

    // Mock data itself is localized, not just chrome: a task type, a status
    // word, a horse name and a notification's generated title/message.
    expect(screen.getByText('تطعيم')).toBeInTheDocument(); // task type, derived from `type`
    expect(screen.getAllByText('ليلى').length).toBeGreaterThan(0); // localized horse name
    expect(screen.getByText('تذكير بالتطعيم')).toBeInTheDocument(); // notification title, derived from category
    expect(screen.getByText(/ليلى لديها موعد تطعيم مستحق/)).toBeInTheDocument();
    expect(screen.getAllByText('مستحق اليوم').length).toBeGreaterThan(0); // task status word

    // No English UI chrome leaking through the panels that were just checked.
    expect(screen.queryByText('Upcoming tasks')).toBeNull();
    expect(screen.queryByText('Health overview')).toBeNull();
    expect(screen.queryByText('Vaccination reminder')).toBeNull();

    expect(document.documentElement.dir).toBe('rtl');
  });

  it('keeps the Smart Actions and Quick Actions sections in Arabic too', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'ar');
    await renderDashboard();

    expect(await screen.findByText('إجراءات سريعة', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'الإجراءات الذكية' })).toBeInTheDocument();
  });

  it('shows Arabic loading, error and empty states', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'ar');
    await renderDashboard('error');

    expect(await screen.findByRole('alert', undefined, LOAD_TIMEOUT)).toHaveTextContent(
      'حدث خطأ أثناء تحميل بيانات لوحة التحكم',
    );
    expect(screen.getByRole('button', { name: 'إعادة المحاولة' })).toBeInTheDocument();
  });
});
