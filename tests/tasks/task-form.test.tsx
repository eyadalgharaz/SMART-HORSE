import { afterEach, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { TaskCreatePage } from '@/features/tasks/components/task-create-page';
import { TaskEditPage } from '@/features/tasks/components/task-edit-page';
import { TaskDetailPage } from '@/features/tasks/components/task-detail-page';
import { resetMockHorses } from '@/features/horses/mock/mock-horse-service';
import { resetMockTasks } from '@/features/tasks/mock/mock-task-service';
import { resetMockNotifications } from '@/features/notifications/mock/mock-notification-service';
import { renderWithProviders } from '../test-utils';
import { routerMock } from '../setup';

const LOAD_TIMEOUT = { timeout: 4000 };
const SAVE_TIMEOUT = { timeout: 8000 };

afterEach(() => {
  resetMockHorses();
  resetMockTasks();
  resetMockNotifications();
});

describe('TaskCreatePage (Add task)', () => {
  it('renders the form sections', async () => {
    renderWithProviders(<TaskCreatePage />);

    expect(
      await screen.findByRole('heading', { name: 'Task details' }, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Assignment' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Schedule' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Priority & status' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Notes' })).toBeInTheDocument();
  });

  it('rejects submission when the title is missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskCreatePage />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.click(screen.getByRole('button', { name: /save task/i }));

    expect(await screen.findByText(/enter a short title/i)).toBeInTheDocument();
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('requires a due date for a recurring task', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskCreatePage />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/^title/i), 'Weekly stall clean');
    await user.selectOptions(screen.getByLabelText(/^repeat/i), 'weekly');
    await user.click(screen.getByRole('button', { name: /save task/i }));

    expect(
      await screen.findByText(/a repeating task needs a starting due date/i),
    ).toBeInTheDocument();
  });

  it('requires a due time once a due date is set', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskCreatePage />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/^title/i), 'Task with a date but no time');
    await user.type(screen.getByLabelText(/due date/i), '2026-10-01');
    await user.clear(screen.getByLabelText(/due time/i));
    await user.click(screen.getByRole('button', { name: /save task/i }));

    expect(await screen.findByText(/enter a due time, or clear the due date/i)).toBeInTheDocument();
  });

  it('saves a valid task and redirects to its detail page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskCreatePage />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/^title/i), 'Check the new hay delivery');
    await user.click(screen.getByRole('button', { name: /save task/i }));

    await waitFor(() => expect(routerMock.push).toHaveBeenCalled(), SAVE_TIMEOUT);
    const [href] = routerMock.push.mock.calls.at(-1)!;
    expect(href).toMatch(/^\/tasks\/tk-\d+\?saved=created$/);
  });

  it('pushes an assignment notification when a task is created with an assignee', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskCreatePage />);

    await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.type(screen.getByLabelText(/^title/i), 'Notify me please');
    await user.selectOptions(screen.getByLabelText(/^assignee$/i), 'assignee-yara');
    await user.click(screen.getByRole('button', { name: /save task/i }));

    await waitFor(() => expect(routerMock.push).toHaveBeenCalled(), SAVE_TIMEOUT);

    const { notificationService } = await import('@/features/notifications/notification-service');
    const notifications = await notificationService.listNotifications();
    expect(notifications.some((n) => n.message.includes('Notify me please'))).toBe(true);
  });
});

describe('TaskEditPage (Edit task)', () => {
  it('pre-populates the form from the existing task', async () => {
    renderWithProviders(<TaskEditPage taskId="tk-006" />);

    expect(
      await screen.findByDisplayValue(/bella.*rug check/i, undefined, LOAD_TIMEOUT),
    ).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown task id', async () => {
    renderWithProviders(<TaskEditPage taskId="tk-does-not-exist" />);

    expect(await screen.findByText('Task not found', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^title/i)).toBeNull();
  });

  it('saves an edit and returns to the detail page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskEditPage taskId="tk-006" />);

    const title = await screen.findByLabelText(/^title/i, undefined, LOAD_TIMEOUT);
    await user.clear(title);
    await user.type(title, 'Bella rug check, reassessed');
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/tasks/tk-006?saved=updated'),
      SAVE_TIMEOUT,
    );
  });
});

describe('TaskDetailPage', () => {
  it('renders task details with status, priority and due badges', async () => {
    renderWithProviders(<TaskDetailPage taskId="tk-002" />);

    expect(
      await screen.findByRole('heading', { name: /farrier follow-up for thunder/i }, LOAD_TIMEOUT),
    ).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('shows a not-found state for an unknown task', async () => {
    renderWithProviders(<TaskDetailPage taskId="tk-does-not-exist" />);

    expect(await screen.findByText('Task not found', undefined, LOAD_TIMEOUT)).toBeInTheDocument();
  });

  it('marks the task complete and shows the saved confirmation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskDetailPage taskId="tk-003" />);

    await screen.findByRole('heading', { name: /deworming dose/i }, LOAD_TIMEOUT);
    await user.click(screen.getByRole('button', { name: /mark complete/i }));

    await waitFor(
      () => expect(routerMock.push).toHaveBeenCalledWith('/tasks/tk-003?saved=completed'),
      SAVE_TIMEOUT,
    );
  });

  it('offers no status actions for an already completed task', async () => {
    renderWithProviders(<TaskDetailPage taskId="tk-030" />);

    await screen.findByRole('heading', { name: /spring vaccinations/i }, LOAD_TIMEOUT);
    expect(screen.queryByRole('button', { name: /mark complete/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /^start$/i })).toBeNull();
  });
});
