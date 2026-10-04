import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { TasksOverviewPage } from '@/features/tasks/components/task-overview-page';
import { resetMockTasks } from '@/features/tasks/mock/mock-task-service';
import { resetMockNotifications } from '@/features/notifications/mock/mock-notification-service';
import { renderWithProviders } from '../test-utils';

const LOAD_TIMEOUT = { timeout: 4000 };

function renderPage(mockScenario?: 'error' | 'empty') {
  window.history.replaceState({}, '', mockScenario ? `/tasks?mock=${mockScenario}` : '/tasks');
  return renderWithProviders(<TasksOverviewPage />);
}

function present(text: string | RegExp): boolean {
  return screen.queryAllByText(text).length > 0;
}

afterEach(() => {
  resetMockTasks();
  resetMockNotifications();
  window.history.replaceState({}, '', '/');
});

describe('TasksOverviewPage', () => {
  it('shows a skeleton while loading, then the tasks', async () => {
    renderPage();

    expect(screen.getByText('Loading tasks')).toBeInTheDocument();
    await screen.findAllByText(/morning feed round/i, undefined, LOAD_TIMEOUT);
    expect(screen.queryByText('Loading tasks')).toBeNull();
  });

  it('shows the farm task summary', async () => {
    renderPage();
    await screen.findAllByText(/morning feed round/i, undefined, LOAD_TIMEOUT);

    expect(present('Due today')).toBe(true);
    expect(present('Overdue')).toBe(true);
    expect(present('In progress')).toBe(true);
    expect(present('Completed')).toBe(true);
  });

  it('filters as the user searches', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText(/morning feed round/i, undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search tasks/i), 'trough');

    expect(present(/reset luna.s paddock water trough/i)).toBe(true);
    expect(present(/morning feed round/i)).toBe(false);
  });

  it('filters by horse and category together', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText(/morning feed round/i, undefined, LOAD_TIMEOUT);

    await user.selectOptions(screen.getByLabelText(/filter by horse/i), 'luna');
    await user.selectOptions(screen.getByLabelText(/filter by category/i), 'stable');

    expect(present(/reset luna.s paddock water trough/i)).toBe(true);
    expect(present(/endurance program weigh-in/i)).toBe(false); // Luna, but category is training
  });

  it('switches between tabs and only shows matching tasks', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText(/morning feed round/i, undefined, LOAD_TIMEOUT);

    await user.click(screen.getByRole('tab', { name: 'Overdue' }));
    expect(present(/reset luna.s paddock water trough/i)).toBe(true);
    expect(present(/^morning feed round$/i)).toBe(false);

    await user.click(screen.getByRole('tab', { name: 'Completed' }));
    expect(present(/spring vaccinations/i)).toBe(true);
    expect(present(/reset luna.s paddock water trough/i)).toBe(false);
  });

  it('distinguishes no results from an empty farm', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText(/morning feed round/i, undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search tasks/i), 'no such task anywhere at all');
    expect(await screen.findByText('No tasks match your search')).toBeInTheDocument();
  });

  it('shows the empty state for a farm with no tasks', async () => {
    renderPage('empty');

    expect(await screen.findByText('No tasks yet', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
  });

  it('shows the error state with retry', async () => {
    renderPage('error');

    expect(await screen.findByRole('alert', undefined, LOAD_TIMEOUT)).toHaveTextContent(
      "We couldn't load your tasks",
    );
  });

  it('lets a pending task be started and then completed from the list', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText(/morning feed round/i, undefined, LOAD_TIMEOUT);

    await user.type(screen.getByLabelText(/search tasks/i), 'willow');
    await screen.findAllByText(/groom before the lesson/i, undefined, LOAD_TIMEOUT);

    const startButtons = screen.getAllByRole('button', { name: /start/i });
    await user.click(startButtons[0]!);

    expect(
      await screen.findAllByRole('button', { name: /complete/i }, LOAD_TIMEOUT),
    ).not.toHaveLength(0);
  });
});
