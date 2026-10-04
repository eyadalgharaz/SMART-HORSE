import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { DashboardError } from '@/features/dashboard/components/dashboard-error';
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header';
import { HealthOverviewPanel } from '@/features/dashboard/components/health-overview';
import { HorseActivityPanel } from '@/features/dashboard/components/horse-activity';
import { RecentNotifications } from '@/features/dashboard/components/recent-notifications';
import { SummaryCards } from '@/features/dashboard/components/summary-cards';
import { UpcomingTasks } from '@/features/dashboard/components/upcoming-tasks';
import {
  buildDashboardMock,
  buildEmptyDashboardMock,
} from '@/features/dashboard/mock/dashboard-mock-data';
import { renderWithProviders as render } from '../test-utils';

// Saturday 19 September 2026, 09:00 local time.
const NOW = new Date(2026, 8, 19, 9, 0);
const data = buildDashboardMock(NOW);
const empty = buildEmptyDashboardMock(NOW);
const ref = data.generatedAt;

describe('DashboardHeader', () => {
  it('greets the user by first name and shows the farm', () => {
    render(<DashboardHeader firstName="Ahmed" farmName="Green Valley Farm" now={NOW} />);

    expect(screen.getByRole('heading', { name: 'Good morning, Ahmed' })).toBeInTheDocument();
    expect(
      screen.getByText("Here's what's happening at Green Valley Farm today."),
    ).toBeInTheDocument();
    expect(screen.getByText('Green Valley Farm')).toBeInTheDocument();
  });

  it('adapts the greeting to the time of day and works without a name', () => {
    render(<DashboardHeader firstName={null} farmName={null} now={new Date(2026, 8, 19, 20)} />);
    expect(screen.getByRole('heading', { name: 'Good evening' })).toBeInTheDocument();
  });

  it('does not offer a farm switcher that does nothing', () => {
    render(<DashboardHeader firstName="Ahmed" farmName="Green Valley Farm" now={NOW} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('SummaryCards', () => {
  it('shows the four headline figures with supporting detail', () => {
    render(<SummaryCards summary={data.summary} referenceIso={ref} />);

    const cards = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(cards).toHaveLength(4);

    expect(cards[0]).toHaveTextContent('Total horses');
    expect(cards[0]).toHaveTextContent('42');
    expect(cards[0]).toHaveTextContent('+2 vs last month');

    expect(cards[1]).toHaveTextContent('Upcoming visits');
    expect(cards[1]).toHaveTextContent('5');
    expect(cards[1]).toHaveTextContent('Next: Tomorrow');

    expect(cards[2]).toHaveTextContent('Vaccinations');
    expect(cards[2]).toHaveTextContent('8');
    expect(cards[2]).toHaveTextContent('3 due this week');

    expect(cards[3]).toHaveTextContent('Pending tasks');
    expect(cards[3]).toHaveTextContent('12');
    expect(cards[3]).toHaveTextContent('4 due today');
  });

  it('has an accessible heading for the group', () => {
    render(<SummaryCards summary={data.summary} referenceIso={ref} />);
    expect(screen.getByRole('heading', { name: 'Farm summary' })).toBeInTheDocument();
  });

  it('words zero and negative cases plainly', () => {
    render(<SummaryCards summary={empty.summary} referenceIso={ref} />);
    expect(screen.getByText('No horses added yet')).toBeInTheDocument();
    expect(screen.getByText('None scheduled')).toBeInTheDocument();
    expect(screen.getByText('None due this week')).toBeInTheDocument();
    expect(screen.getByText('None due today')).toBeInTheDocument();
  });

  it('reports a decrease with a minus sign', () => {
    const summary = { ...data.summary, totalHorses: { value: 39, previousMonthValue: 42 } };
    render(<SummaryCards summary={summary} referenceIso={ref} />);
    expect(screen.getByText('−3 vs last month')).toBeInTheDocument();
  });
});

describe('HorseActivityPanel', () => {
  it('summarises the week and compares it with the previous one', () => {
    render(<HorseActivityPanel activity={data.activity} referenceIso={ref} />);

    expect(screen.getByRole('heading', { name: 'Horse activity' })).toBeInTheDocument();
    expect(screen.getByText('71')).toBeInTheDocument();
    expect(screen.getByText(/sessions in the last 7 days/i)).toBeInTheDocument();
    expect(screen.getByText(/\+11% vs the 7 days before/)).toBeInTheDocument();
  });

  it('gives assistive tech the exact values as a data table, marking today', () => {
    render(<HorseActivityPanel activity={data.activity} referenceIso={ref} />);

    const table = screen.getByRole('table', { name: /sessions logged per day/i });
    expect(within(table).getAllByRole('row')).toHaveLength(8); // header + 7 days

    const today = within(table).getByRole('row', { name: /saturday \(today\)/i });
    expect(today).toHaveTextContent('7');
    expect(within(table).getByRole('row', { name: /thursday/i })).toHaveTextContent('14');
  });

  it('labels today in text, not only with colour', () => {
    render(<HorseActivityPanel activity={data.activity} referenceIso={ref} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('shows a calm empty state when nothing was logged', () => {
    render(<HorseActivityPanel activity={empty.activity} referenceIso={ref} />);
    expect(screen.getByText('No activity in the last 7 days')).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
  });
});

describe('UpcomingTasks', () => {
  it('lists each task with horse, due label and a status word', () => {
    render(<UpcomingTasks tasks={data.upcomingTasks} referenceIso={ref} />);

    const rows = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(rows).toHaveLength(5);

    expect(rows[0]).toHaveTextContent('Farrier visit');
    expect(rows[0]).toHaveTextContent('Duke');
    expect(rows[0]).toHaveTextContent('Yesterday · 2:00 PM');
    expect(rows[0]).toHaveTextContent('Overdue');

    expect(rows[1]).toHaveTextContent('Vaccination');
    expect(rows[1]).toHaveTextContent('Luna');
    expect(rows[1]).toHaveTextContent('Today · 10:00 AM');
    expect(rows[1]).toHaveTextContent('Due today');
    expect(rows[1]).toHaveTextContent('High priority');

    expect(rows[3]).toHaveTextContent('Veterinary check');
    expect(rows[3]).toHaveTextContent('Tomorrow · 9:30 AM');
    expect(rows[3]).toHaveTextContent('Upcoming');
  });

  it('only flags high priority, and exposes machine-readable times', () => {
    render(<UpcomingTasks tasks={data.upcomingTasks} referenceIso={ref} />);
    expect(screen.getAllByText('High priority')).toHaveLength(1);

    const time = screen.getByText('Today · 10:00 AM');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('dateTime', data.upcomingTasks[1]!.dueAt);
  });

  it('renders the completed status', () => {
    const tasks = [{ ...data.upcomingTasks[1]!, status: 'completed' as const }];
    render(<UpcomingTasks tasks={tasks} referenceIso={ref} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('links to the tasks area with a distinguishable accessible name', () => {
    render(<UpcomingTasks tasks={data.upcomingTasks} referenceIso={ref} />);
    expect(screen.getByRole('link', { name: 'View all tasks' })).toHaveAttribute('href', '/tasks');
  });

  it('shows an encouraging empty state instead of an error', () => {
    render(<UpcomingTasks tasks={[]} referenceIso={ref} />);
    expect(screen.getByText('No upcoming tasks')).toBeInTheDocument();
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('HealthOverviewPanel', () => {
  it('shows coverage and the four health counts', () => {
    render(<HealthOverviewPanel health={data.health} referenceIso={ref} />);

    const bar = screen.getByRole('progressbar', { name: /vaccinations up to date/i });
    expect(bar).toHaveAttribute('aria-valuenow', '34');
    expect(bar).toHaveAttribute('aria-valuemax', '42');
    expect(screen.getByText('34 of 42 horses (81%)')).toBeInTheDocument();

    const stat = (label: string) => screen.getByText(label).closest('div')!;
    expect(stat('Vaccinations')).toHaveTextContent('8');
    expect(stat('Vaccinations')).toHaveTextContent('3 due this week');
    expect(stat('Medical visits')).toHaveTextContent('5');
    expect(stat('Medical visits')).toHaveTextContent('Next: Tomorrow');
    expect(stat('Active treatments')).toHaveTextContent('3');
    expect(stat('Active treatments')).toHaveTextContent('3 horses');
    expect(stat('Follow-ups')).toHaveTextContent('2');
    expect(stat('Follow-ups')).toHaveTextContent('1 due this week');
  });

  it('links to the health area', () => {
    render(<HealthOverviewPanel health={data.health} referenceIso={ref} />);
    expect(screen.getByRole('link', { name: 'View all health' })).toHaveAttribute(
      'href',
      '/medical',
    );
  });

  it('shows an empty state and no progress bar for a farm with no horses', () => {
    render(<HealthOverviewPanel health={empty.health} referenceIso={ref} />);
    expect(screen.getByText('No health items yet')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});

describe('RecentNotifications', () => {
  it('lists notifications with message and relative time', () => {
    render(<RecentNotifications notifications={data.notifications} referenceIso={ref} />);

    const rows = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(rows).toHaveLength(4);
    expect(rows[0]).toHaveTextContent('Vaccination reminder');
    expect(rows[0]).toHaveTextContent('Luna is due for vaccination.');
    expect(rows[0]).toHaveTextContent('10 minutes ago');
    expect(rows[1]).toHaveTextContent('Veterinary appointment');
    expect(rows[1]).toHaveTextContent('1 hour ago');
    expect(rows[2]).toHaveTextContent('2 hours ago');
  });

  it('announces unread items in text', () => {
    render(<RecentNotifications notifications={data.notifications} referenceIso={ref} />);
    const rows = screen.getAllByRole('listitem');
    expect(within(rows[0]!).getByText('Unread')).toBeInTheDocument();
    expect(within(rows[2]!).queryByText('Unread')).toBeNull();
  });

  it('links to the notifications area', () => {
    render(<RecentNotifications notifications={data.notifications} referenceIso={ref} />);
    expect(screen.getByRole('link', { name: 'View all notifications' })).toHaveAttribute(
      'href',
      '/notifications',
    );
  });

  it('shows an empty state when there is nothing new', () => {
    render(<RecentNotifications notifications={[]} referenceIso={ref} />);
    expect(screen.getByText('No recent notifications')).toBeInTheDocument();
  });
});

describe('DashboardError', () => {
  it('explains the problem and lets the user retry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<DashboardError onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.getByText(/couldn't load the dashboard data/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
