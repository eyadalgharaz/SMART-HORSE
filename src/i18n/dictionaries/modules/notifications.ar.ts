import type { notificationsEn } from './notifications.en';

/** الإشعارات — العربية. */
export const notificationsAr: typeof notificationsEn = {
  types: {
    'task-assigned': 'إسناد مهمة',
    'task-due-soon': 'مهمة يقترب موعدها',
    'task-overdue': 'مهمة متأخرة',
    'task-completed': 'مهمة مكتملة',
    'medical-reminder': 'تذكير طبي',
    'vaccination-reminder': 'تذكير بالتطعيم',
    'training-reminder': 'تذكير بالتدريب',
    system: 'النظام',
  },
  unread: 'غير مقروء',
  unreadCount: (n: number): string | null => (n === 0 ? null : `${n} غير مقروءة`),
  bell: {
    label: 'الإشعارات',
    labelWithUnread: (n: number) => `الإشعارات، ${n} غير مقروءة`,
    title: 'الإشعارات',
    viewAll: 'عرض الكل',
    loadError: 'تعذّر تحميل الإشعارات.',
    allCaughtUp: 'لا توجد إشعارات جديدة.',
  },
  page: {
    markAllRead: 'تحديد الكل كمقروء',
    filterLabel: 'تصفية الإشعارات',
    all: 'الكل',
    unreadTab: 'غير المقروءة',
    emptyUnreadTitle: 'لا توجد إشعارات غير مقروءة',
    emptyUnreadDescription: 'اطّلعت على كل شيء — لا جديد يحتاج انتباهك.',
    emptyTitle: 'لا توجد إشعارات بعد',
    emptyDescription: 'ستظهر هنا الإشعارات المتعلقة بالمهام والتذكيرات الطبية والتدريب.',
  },
  loading: 'جارٍ تحميل الإشعارات',
};
