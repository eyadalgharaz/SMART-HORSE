import type { DashboardOverview } from '../types';
import { HealthOverviewPanel } from './health-overview';
import { HorseActivityPanel } from './horse-activity';
import { twoColumnGrid } from './layout';
import { QuickActions } from './quick-actions';
import { RecentNotifications } from './recent-notifications';
import { SmartActions } from './smart-actions';
import { SummaryCards } from './summary-cards';
import { UpcomingTasks } from './upcoming-tasks';

/**
 * The loaded dashboard, in order of what a farm owner needs first: quick
 * shortcuts, headline numbers, what SmartHorse would flag right now, then
 * what is happening and what is due, then health and updates.
 */
export function DashboardContent({ data }: { data: DashboardOverview }) {
  const { generatedAt } = data;

  return (
    <div className="space-y-4 sm:space-y-5">
      <QuickActions />

      <SummaryCards summary={data.summary} referenceIso={generatedAt} />

      <SmartActions
        data={{ summary: data.summary, health: data.health, upcomingTasks: data.upcomingTasks }}
        referenceIso={generatedAt}
      />

      <div className={twoColumnGrid}>
        <HorseActivityPanel activity={data.activity} referenceIso={generatedAt} />
        <UpcomingTasks tasks={data.upcomingTasks} referenceIso={generatedAt} />
      </div>

      <div className={twoColumnGrid}>
        <HealthOverviewPanel health={data.health} referenceIso={generatedAt} />
        <RecentNotifications notifications={data.notifications} referenceIso={generatedAt} />
      </div>
    </div>
  );
}
