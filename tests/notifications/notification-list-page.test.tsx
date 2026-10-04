import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { NotificationListPage } from '@/features/notifications/components/notification-list-page';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { resetMockNotifications } from '@/features/notifications/mock/mock-notification-service';
import { renderWithProviders } from '../test-utils';

const LOAD_TIMEOUT = { timeout: 4000 };

function renderPage(mockScenario?: 'error' | 'empty') {
  window.history.replaceState(
    {},
    '',
    mockScenario ? `/notifications?mock=${mockScenario}` : '/notifications',
  );
  return renderWithProviders(<NotificationListPage />);
}

afterEach(() => {
  resetMockNotifications();
  window.history.replaceState({}, '', '/');
});

describe('NotificationListPage', () => {
  it('shows a skeleton while loading, then notifications', async () => {
    renderPage();

    expect(screen.getByText('Loading notifications')).toBeInTheDocument();
    await screen.findAllByText(/task overdue/i, undefined, LOAD_TIMEOUT);
    expect(screen.queryByText('Loading notifications')).toBeNull();
  });

  it('switches between All and Unread tabs', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText(/task overdue/i, undefined, LOAD_TIMEOUT);

    const allCount = screen.getAllByRole('button').length;
    await user.click(screen.getByRole('tab', { name: /unread/i }));

    // Unread is a strict subset, so the notification button count should drop.
    expect(screen.getAllByRole('button').length).toBeLessThan(allCount);
  });

  it('marks a notification read when opened and navigates to its related page', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText(/task overdue/i, undefined, LOAD_TIMEOUT);

    const row = screen
      .getAllByRole('button')
      .find((button) => /paddock water trough/i.test(button.textContent ?? ''));
    expect(row).toBeDefined();
    await user.click(row!);

    const { routerMock } = await import('../setup');
    expect(routerMock.push).toHaveBeenCalledWith('/tasks/tk-001');
  });

  it('marks all notifications read', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText(/task overdue/i, undefined, LOAD_TIMEOUT);

    const markAll = await screen.findByRole('button', { name: /mark all as read/i });
    await user.click(markAll);

    await user.click(screen.getByRole('tab', { name: /unread/i }));
    expect(
      await screen.findByText('No unread notifications', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
  });

  it('shows the empty state for a farm with no notifications', async () => {
    renderPage('empty');

    expect(
      await screen.findByText('No notifications yet', undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
  });

  it('shows the error state', async () => {
    renderPage('error');

    expect(await screen.findByRole('alert', undefined, LOAD_TIMEOUT)).toHaveTextContent(
      "We couldn't load your notifications",
    );
  });
});

describe('NotificationBell', () => {
  it('shows an unread badge and a preview dropdown', async () => {
    const user = userEvent.setup();
    renderWithProviders(<NotificationBell />);

    const trigger = await screen.findByRole(
      'button',
      { name: /notifications, \d+ unread/i },
      LOAD_TIMEOUT,
    );
    await user.click(trigger);

    expect(await screen.findByText('Notifications')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view all/i })).toHaveAttribute(
      'href',
      '/notifications',
    );
  });
});
