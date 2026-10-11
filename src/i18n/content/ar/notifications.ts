import type { TranslationTable } from '../../translate';

/**
 * Notification demo content. Titles and messages are stored as text by the
 * notification service, so the seeded set is translated here, and the two
 * messages the Tasks service composes at runtime ("… was assigned to …",
 * "… was marked complete.") are matched as patterns with their parts
 * translated in turn.
 */
export const arNotifications: TranslationTable = {
  exact: {
    /* ---------------- Titles ---------------- */
    'Task overdue': 'مهمة متأخرة',
    'Task due soon': 'مهمة يقترب موعدها',
    'Task assigned to you': 'مهمة أُسندت إليك',
    'Task completed': 'مهمة مكتملة',
    'Medical reminder': 'تذكير طبي',
    'Vaccination reminder': 'تذكير بالتطعيم',
    'Training reminder': 'تذكير بالتدريب',
    'Scheduled maintenance': 'صيانة مجدولة',
    'Welcome to SmartHorse': 'مرحبًا بك في SmartHorse',
    'New feature: Training progress charts': 'ميزة جديدة: مخططات تقدّم التدريب',

    /* ---------------- Messages ---------------- */
    "Reset Luna's paddock water trough is 4 days overdue.":
      'مهمة «إعادة ضبط حوض المياه في حظيرة ليلى» متأخرة 4 أيام.',
    'Farrier follow-up for Thunder is 2 days overdue.': 'مهمة «متابعة الحدّاد لرعد» متأخرة يومين.',
    "Administer Sultan's deworming dose is due today.":
      'مهمة «إعطاء سلطان جرعة مضاد الديدان» مستحقة اليوم.',
    'Amira — vaccination booster is due in 3 days.':
      'مهمة «أميرة — جرعة التطعيم المعززة» مستحقة بعد 3 أيام.',
    'Shadow — pre-competition tack fitting is due in 4 days.':
      'مهمة «شاهين — ضبط العُدّة قبل المنافسة» مستحقة بعد 4 أيام.',
    'Duke — dental check reminder is 8 days overdue.':
      'مهمة «فارس — تذكير بفحص الأسنان» متأخرة 8 أيام.',
    "Renew the stable's liability insurance is due in 2 weeks.":
      'مهمة «تجديد تأمين المسؤولية للإسطبل» مستحقة بعد أسبوعين.',
    'Reorganise the tack room shelving is 6 days overdue.':
      'مهمة «إعادة ترتيب رفوف غرفة السروج» متأخرة 6 أيام.',
    'Weekly stall deep clean is due tomorrow.':
      'مهمة «التنظيف العميق الأسبوعي للحظائر» مستحقة غدًا.',
    "Thunder is due for a recheck following last week's farrier visit.":
      'موعد إعادة فحص رعد بعد زيارة الحدّاد في الأسبوع الماضي.',
    "Amira's vaccination booster is coming up this week.":
      'موعد جرعة التطعيم المعززة لأميرة هذا الأسبوع.',
    "Mistral's next vaccination round should be scheduled soon.":
      'يجب جدولة الجولة التالية من تطعيمات نسيم قريبًا.',
    "Saffron's hoof abscess should be checked again in a few days.":
      'يجب إعادة فحص خُرّاج حافر عنبر خلال أيام قليلة.',
    "Orion's lameness recheck is approaching.": 'يقترب موعد إعادة فحص العرج للنسر.',
    "Sultan's 20 km endurance trial run is scheduled for next week.":
      'جولة سلطان التجريبية للتحمّل لمسافة 20 كم مجدولة الأسبوع القادم.',
    "Duke's dressage program kicks off this week.": 'ينطلق برنامج الترويض لفارس هذا الأسبوع.',
    "Nova's peak speed test is coming up.": 'يقترب موعد اختبار السرعة القصوى لنجمة.',
    "Willow's ridden lesson prep session is scheduled soon.":
      'جلسة التحضير لدرس الركوب لسحاب مجدولة قريبًا.',
    'SmartHorse will be briefly unavailable overnight for scheduled maintenance.':
      'سيتوقف SmartHorse لفترة وجيزة خلال الليل لإجراء صيانة مجدولة.',
    'Your farm workspace is set up. Explore Horses, Medical, Training and Tasks from the sidebar.':
      'تم إعداد مساحة عمل مزرعتك. استكشف الخيول والصحة والتدريب والمهام من القائمة الجانبية.',
    'Horse training profiles now show distance and speed progress over recent sessions.':
      'تعرض ملفات تدريب الخيول الآن تقدّم المسافة والسرعة في الجلسات الأخيرة.',
    'Pearl is due for a deworming rotation soon.': 'يقترب موعد دورة مضاد الديدان للؤلؤة.',
    "Storm's next race-pace simulation is scheduled soon.":
      'محاكاة وتيرة السباق التالية لبرق مجدولة قريبًا.',
  },
  patterns: [
    {
      pattern: /^(.+) was assigned to (.+)\.$/,
      render: (m, tr) => `أُسندت مهمة «${tr(m[1] ?? '')}» إلى ${tr(m[2] ?? '')}.`,
    },
    {
      pattern: /^(.+) was marked complete\.$/,
      render: (m, tr) => `تم إنجاز مهمة «${tr(m[1] ?? '')}».`,
    },
    { pattern: /^a team member$/, render: () => 'أحد أعضاء الفريق' },
  ],
};
