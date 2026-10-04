import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { QuickActions } from '@/features/dashboard/components/quick-actions';
import { SmartActions } from '@/features/dashboard/components/smart-actions';
import {
  buildDashboardMock,
  buildEmptyDashboardMock,
} from '@/features/dashboard/mock/dashboard-mock-data';
import { renderWithProviders } from '../test-utils';

const NOW = new Date(2026, 8, 19, 9, 0);
const data = buildDashboardMock(NOW);
const empty = buildEmptyDashboardMock(NOW);
const ref = data.generatedAt;

function pick(overrides: Partial<typeof data> = {}) {
  const base = { summary: data.summary, health: data.health, upcomingTasks: data.upcomingTasks };
  return { ...base, ...overrides };
}

describe('SmartActions', () => {
  it('flags vaccinations due this week, overdue tasks, and a visit scheduled tomorrow — all from existing data', () => {
    renderWithProviders(<SmartActions data={pick()} referenceIso={ref} />);

    expect(screen.getByRole('heading', { name: 'Smart actions' })).toBeInTheDocument();
    expect(screen.getByText(/vaccinations due this week/)).toBeInTheDocument();
    expect(screen.getByText(/passed their due date/)).toBeInTheDocument();
    expect(screen.getByText(/visit is scheduled tomorrow/)).toBeInTheDocument();
  });

  it('links each card to an existing route, never a fabricated one', () => {
    renderWithProviders(<SmartActions data={pick()} referenceIso={ref} />);

    for (const link of screen.getAllByRole('link')) {
      expect(['/medical', '/tasks']).toContain(link.getAttribute('href'));
    }
  });

  it('shows an all-clear message when nothing needs attention', () => {
    renderWithProviders(
      <SmartActions
        data={{ summary: empty.summary, health: empty.health, upcomingTasks: [] }}
        referenceIso={ref}
      />,
    );

    expect(screen.getByText(/all clear/i)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('counts overdue tasks from the task list itself, not a separate figure', () => {
    const tasks = [
      { ...data.upcomingTasks[0]!, status: 'overdue' as const },
      { ...data.upcomingTasks[1]!, status: 'overdue' as const },
    ];
    renderWithProviders(
      <SmartActions
        data={{ summary: empty.summary, health: empty.health, upcomingTasks: tasks }}
        referenceIso={ref}
      />,
    );
    expect(screen.getByText(/2 tasks have passed their due date/)).toBeInTheDocument();
  });
});

describe('QuickActions', () => {
  it('links to real, existing application routes only', () => {
    renderWithProviders(<QuickActions />);

    expect(screen.getByRole('link', { name: 'Add horse' })).toHaveAttribute('href', '/horses/new');
    expect(screen.getByRole('link', { name: 'Add task' })).toHaveAttribute('href', '/tasks/new');
    expect(screen.getByRole('link', { name: 'View notifications' })).toHaveAttribute(
      'href',
      '/notifications',
    );
  });
});
