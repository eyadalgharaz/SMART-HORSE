/**
 * Dashboard read models.
 *
 * The Dashboard is a read-only aggregation view (Module Specifications v1.0 §3):
 * it displays figures owned by other modules and never edits them. These types
 * describe what the UI needs, in the shape a future `GET /api/v1/dashboard`
 * response can satisfy. Dates are ISO 8601 strings; the UI formats them, so the
 * server never has to send display text.
 */

export interface DashboardFarm {
  id: string;
  name: string;
}

export interface DashboardSummary {
  totalHorses: {
    value: number;
    /** Horses at the same point last month; null when there is no history yet. */
    previousMonthValue: number | null;
  };
  upcomingVisits: {
    value: number;
    /** Start of the soonest visit, or null when none is scheduled. */
    nextAt: string | null;
  };
  vaccinations: {
    value: number;
    dueThisWeek: number;
  };
  pendingTasks: {
    value: number;
    dueToday: number;
  };
}

export interface ActivityDay {
  /** Calendar day, ISO 8601 date-time at the start of that day (local to the farm). */
  date: string;
  sessions: number;
}

/** One data series: sessions logged per day, oldest first. */
export interface HorseActivity {
  days: ActivityDay[];
  /** Sessions logged in the equally long period before `days`, for comparison. */
  previousPeriodTotal: number;
}

export type TaskType = 'vaccination' | 'veterinary' | 'farrier' | 'training' | 'feeding';
export type TaskStatus = 'upcoming' | 'due-today' | 'overdue' | 'completed';
export type TaskPriority = 'high' | 'normal' | 'low';

export interface UpcomingTask {
  id: string;
  type: TaskType;
  /** The horse's canonical (English) display name; the UI localizes it for display. */
  horseName: string;
  dueAt: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface HealthOverview {
  vaccinations: { count: number; dueThisWeek: number };
  medicalVisits: { count: number; nextAt: string | null };
  activeTreatments: { count: number; horsesAffected: number };
  followUps: { count: number; dueThisWeek: number };
  /** Horses with no vaccination overdue, out of all horses. */
  vaccinationCoverage: { upToDate: number; total: number };
}

export type NotificationCategory = 'vaccination' | 'appointment' | 'training' | 'health' | 'task';

export interface DashboardNotification {
  id: string;
  category: NotificationCategory;
  /** The horse's canonical (English) display name; the UI localizes it and builds the
   *  title/message from `category` (and `taskType`, for `category: 'task'`) via the i18n
   *  dictionary, so the same record renders correctly in either language. */
  horseName: string;
  /** Only meaningful for `category: 'task'`. */
  taskType?: TaskType;
  createdAt: string;
  read: boolean;
}

export interface DashboardOverview {
  /** When the server produced this snapshot; relative dates are measured from it. */
  generatedAt: string;
  farm: DashboardFarm;
  summary: DashboardSummary;
  activity: HorseActivity;
  /** Most important items first. The Tasks module owns the full list. */
  upcomingTasks: UpcomingTask[];
  health: HealthOverview;
  /** Newest first. The Notifications module owns the full list. */
  notifications: DashboardNotification[];
}

/**
 * The only contract the Dashboard UI depends on. Phase B ships a mock
 * implementation; a later phase swaps in an HTTP client against /api/v1
 * without touching any component.
 */
export interface DashboardService {
  getOverview(): Promise<DashboardOverview>;
}

/** Failure the UI renders as the dashboard error state. */
export class DashboardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DashboardError';
  }
}
