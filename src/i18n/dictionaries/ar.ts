import type { Dictionary } from './en';

/**
 * Typed against `Dictionary` (the English shape) so a missing key is a
 * compile error. Wording is written for the screen it appears on, not
 * translated sentence-by-sentence from the English — see the project's
 * localization guidance for why (e.g. "Health" reads as "الصحة" here, not a
 * literal rendering of "Medical").
 *
 * "SmartHorse" is kept as the product name (Latin script) throughout, the
 * same way most Arabic commercial software keeps its own brand name.
 */
export const ar: Dictionary = {
  common: {
    save: 'حفظ',
    saveChanges: 'حفظ التغييرات',
    cancel: 'إلغاء',
    loading: 'جارٍ التحميل…',
    tryAgain: 'إعادة المحاولة',
    somethingWentWrong: 'حدث خطأ ما',
    signOut: 'تسجيل الخروج',
    accountMenu: 'قائمة الحساب',
    close: 'إغلاق',
  },
  language: {
    switcherLabel: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    switchTo: (name: string) => `التبديل إلى ${name}`,
  },
  shell: {
    openNavigation: 'فتح قائمة التنقل',
    closeNavigation: 'إغلاق قائمة التنقل',
    mainNav: 'التنقل الرئيسي',
    sections: {
      stable: 'الإسطبل',
      account: 'الحساب',
    },
    nav: {
      dashboard: 'لوحة التحكم',
      horses: 'الخيل',
      health: 'الصحة',
      training: 'التدريب',
      tasks: 'المهام',
      notifications: 'الإشعارات',
      settings: 'الإعدادات',
    },
  },
  roles: {
    FarmOwner: {
      label: 'مالك المزرعة',
      description: 'صلاحية كاملة على جميع أقسام المزرعة، بما في ذلك الفريق والإعدادات.',
    },
    StableManager: {
      label: 'مدير الإسطبل',
      description: 'يدير العمليات اليومية: الخيول، والمهام، وفريق العمل.',
    },
    Trainer: {
      label: 'المدرب',
      description: 'يخطط لبرامج التدريب ويسجّل نتائج الجلسات.',
    },
    Worker: {
      label: 'العامل',
      description: 'يتولى العمل اليومي في الإسطبل: التغذية والعناية والمهام الروتينية.',
    },
    Doctor: {
      label: 'الطبيب البيطري',
      description: 'يدير السجلات الطبية للخيول وتاريخها الصحي.',
    },
  },
  auth: {
    login: {
      title: 'تسجيل الدخول',
      description: 'أدر إسطبلك وخيولك وأعمالك اليومية من مكان واحد.',
      emailLabel: 'البريد الإلكتروني',
      passwordLabel: 'كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      submit: 'تسجيل الدخول',
      submitting: 'جارٍ تسجيل الدخول',
      newToSmartHorse: 'جديد على SmartHorse؟',
      createAccount: 'إنشاء حساب',
      genericError: 'فشل تسجيل الدخول. حاول مرة أخرى.',
    },
    register: {
      title: 'إنشاء حسابك',
      description: 'أنشئ حسابك أولاً، ثم يمكنك إضافة مزرعتك مباشرة بعد ذلك.',
      fullNameLabel: 'الاسم الكامل',
      emailLabel: 'البريد الإلكتروني',
      passwordLabel: 'كلمة المرور',
      passwordHint: '8 أحرف على الأقل، تتضمن حرفًا ورقمًا.',
      confirmPasswordLabel: 'تأكيد كلمة المرور',
      roleLabel: 'الدور الوظيفي',
      submit: 'إنشاء الحساب',
      submitting: 'جارٍ إنشاء الحساب',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      signIn: 'تسجيل الدخول',
      genericError: 'تعذّر إنشاء الحساب.',
    },
    forgotPassword: {
      title: 'إعادة تعيين كلمة المرور',
      description:
        'أدخل البريد الإلكتروني المستخدم في حسابك على SmartHorse وسنرسل لك رابطًا لإعادة التعيين.',
      emailLabel: 'البريد الإلكتروني',
      submit: 'إرسال رابط إعادة التعيين',
      submitting: 'جارٍ إرسال الرابط',
      sentTitle: 'تم إرسال تعليمات إعادة تعيين كلمة المرور.',
      sentBody: (email: string) =>
        `تحقق من بريدك ${email} للحصول على رابط تعيين كلمة مرور جديدة. ينتهي صلاحية الرابط خلال 30 دقيقة.`,
      backToSignIn: 'العودة إلى تسجيل الدخول',
      genericError: 'تعذّر إرسال رابط إعادة التعيين.',
    },
    resetPassword: {
      title: 'تعيين كلمة مرور جديدة',
      description: 'اختر كلمة مرور لم تستخدمها من قبل في SmartHorse.',
      newPasswordLabel: 'كلمة المرور الجديدة',
      newPasswordHint: '8 أحرف على الأقل، تتضمن حرفًا ورقمًا.',
      confirmLabel: 'تأكيد كلمة المرور الجديدة',
      submit: 'تحديث كلمة المرور',
      submitting: 'جارٍ تحديث كلمة المرور',
      doneTitle: 'تم تحديث كلمة المرور بنجاح.',
      doneBody: 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
      goToSignIn: 'الانتقال لتسجيل الدخول',
      backToSignIn: 'العودة إلى تسجيل الدخول',
      genericError: 'تعذّر تحديث كلمة المرور.',
    },
  },
  dashboards: {
    signedInAs: (name: string) => `مسجّل الدخول باسم ${name}`,
    readyForImplementation: (roleLabel: string) => `لوحة تحكم ${roleLabel} — جاهزة للتطوير`,
    placeholderNote: 'هذه لوحة مؤقتة. لم يتم بناء لوحة التحكم الفعلية لهذا الدور بعد.',
    trainerTitle: 'لوحة تحكم المدرب',
    workerTitle: 'لوحة تحكم العامل',
    doctorTitle: 'لوحة تحكم الطبيب البيطري',
  },
  pages: {
    horses: {
      title: 'الخيل',
      description: 'جميع خيول المزرعة، ببياناتها وأوراقها الثبوتية.',
      errorTitle: 'تعذّر تحميل بيانات الخيول',
      errorDescription: 'حدث خطأ أثناء تحميل قائمة الخيول. تحقق من اتصالك وحاول مرة أخرى.',
      addHorse: 'إضافة حصان',
      emptyTitle: 'لا توجد خيول بعد',
      emptyDescription: 'أضف أول حصان لبدء حفظ سجلاته في SmartHorse.',
    },
    medical: {
      title: 'الصحة',
      description: 'السجلات الطبية والتطعيمات والرعاية القادمة لكل حصان في المزرعة.',
      errorTitle: 'تعذّر تحميل السجلات الطبية',
      errorDescription: 'حدث خطأ أثناء تحميل البيانات الصحية. تحقق من اتصالك وحاول مرة أخرى.',
    },
    training: {
      title: 'التدريب',
      description: 'برامج التدريب والجلسات والنتائج والأداء لكل حصان.',
      errorTitle: 'تعذّر تحميل بيانات التدريب',
      errorDescription: 'حدث خطأ أثناء تحميل بيانات التدريب. تحقق من اتصالك وحاول مرة أخرى.',
    },
    tasks: {
      title: 'المهام',
      description: 'أعمال الإسطبل والمزرعة اليوم — ما هو مستحق، ومن يقوم به، وما تأخر عن موعده.',
      errorTitle: 'تعذّر تحميل المهام',
      errorDescription: 'حدث خطأ أثناء تحميل مهامك. تحقق من اتصالك وحاول مرة أخرى.',
    },
    notifications: {
      title: 'الإشعارات',
      description: 'كل ما يحتاج انتباهك في المزرعة، في مكان واحد.',
      errorTitle: 'تعذّر تحميل الإشعارات',
      errorDescription: 'حدث خطأ أثناء تحميل إشعاراتك. تحقق من اتصالك وحاول مرة أخرى.',
    },
    settings: {
      title: 'الإعدادات',
      description: 'إدارة مزرعتك وصلاحيات الفريق وحسابك.',
    },
  },
  dashboard: {
    greeting: { morning: 'صباح الخير', afternoon: 'مساء الخير', evening: 'طاب مساؤك' },
    heroSummary: (farmName: string) => `إليك ملخص ما يحدث في ${farmName} اليوم.`,
    farmLabelSrPrefix: 'المزرعة: ',
    relativeDay: { today: 'اليوم', tomorrow: 'غدًا', yesterday: 'أمس' },
    relativeTime: {
      justNow: 'الآن',
      minutesAgo: (n: number) =>
        n === 1
          ? 'منذ دقيقة'
          : n === 2
            ? 'منذ دقيقتين'
            : n <= 10
              ? `منذ ${n} دقائق`
              : `منذ ${n} دقيقة`,
      hoursAgo: (n: number) =>
        n === 1
          ? 'منذ ساعة'
          : n === 2
            ? 'منذ ساعتين'
            : n <= 10
              ? `منذ ${n} ساعات`
              : `منذ ${n} ساعة`,
      daysAgo: (n: number) =>
        n === 2 ? 'منذ يومين' : n <= 10 ? `منذ ${n} أيام` : `منذ ${n} يومًا`,
    },
    taskTypes: {
      vaccination: 'تطعيم',
      veterinary: 'فحص بيطري',
      farrier: 'زيارة الحداد',
      training: 'جلسة تدريب',
      feeding: 'مراجعة خطة التغذية',
    },
    taskStatus: {
      upcoming: 'قادم',
      'due-today': 'مستحق اليوم',
      overdue: 'متأخر',
      completed: 'مكتمل',
    } as Record<'upcoming' | 'due-today' | 'overdue' | 'completed', string>,
    highPriority: 'أولوية عالية',
    notificationTemplates: {
      vaccinationReminder: {
        title: 'تذكير بالتطعيم',
        message: (horseName: string) => `${horseName} لديها موعد تطعيم مستحق.`,
      },
      appointmentScheduled: {
        title: 'موعد بيطري',
        message: (horseName: string) => `تم تحديد موعد بيطري لـ${horseName}.`,
      },
      trainingReminder: {
        title: 'تذكير بالتدريب',
        message: (horseName: string) => `${horseName} لديها جلسة تدريب اليوم.`,
      },
      taskOverdue: {
        title: 'مهمة متأخرة',
        message: (taskTypeLabel: string, horseName: string) =>
          `${taskTypeLabel} لـ${horseName} كانت مستحقة أمس.`,
      },
      healthUpdate: {
        title: 'تحديث صحي',
        message: (horseName: string) => `تم تحديث السجل الصحي لـ${horseName}.`,
      },
    },
    summary: {
      sectionTitle: 'ملخص المزرعة',
      totalHorses: 'إجمالي الخيل',
      upcomingVisits: 'الزيارات القادمة',
      vaccinations: 'التطعيمات',
      pendingTasks: 'المهام المعلّقة',
      noHorsesAddedYet: 'لم تتم إضافة خيول بعد',
      noHistoryYet: 'لا يوجد سجل سابق',
      noChangeVsLastMonth: 'لا تغيير عن الشهر الماضي',
      changeVsLastMonth: (signedAmount: string) => `${signedAmount} عن الشهر الماضي`,
      nextVisit: (dayLabel: string) => `التالية: ${dayLabel}`,
      noneScheduled: 'لا يوجد موعد مجدول',
      dueThisWeek: (n: number) => `${n} مستحق هذا الأسبوع`,
      noneDueThisWeek: 'لا شيء مستحق هذا الأسبوع',
      dueToday: (n: number) => `${n} مستحق اليوم`,
      noneDueToday: 'لا شيء مستحق اليوم',
    },
    activity: {
      sectionTitle: 'نشاط الخيل',
      sectionDescription: 'الجلسات المسجّلة لخيولك',
      periodLabel: 'آخر 7 أيام',
      sessionsIn: (sessionsWord: string, period: string) => `${sessionsWord} خلال ${period}`,
      session: 'جلسة',
      sessions: 'جلسات',
      noChange: 'لا تغيير',
      trendVsPrevious: (changeText: string) => `${changeText} مقارنة بالأسبوع السابق`,
      caption: (range: string) => `الجلسات المسجّلة يوميًا، ${range}`,
      dayColumnHeader: 'اليوم',
      sessionsColumnHeader: 'الجلسات',
      emptyTitle: 'لا يوجد نشاط خلال آخر 7 أيام',
      emptyDescription: 'ستظهر هنا الجلسات المسجّلة لخيولك.',
    },
    health: {
      sectionTitle: 'الحالة الصحية',
      vaccinations: 'التطعيمات',
      medicalVisits: 'الزيارات الطبية',
      activeTreatments: 'العلاجات الجارية',
      followUps: 'المتابعات',
      vaccinationCoverageTitle: 'التطعيمات محدّثة',
      coverageOf: (upToDate: number, total: number, percent: number) =>
        `${upToDate} من ${total} حصانًا (${percent}%)`,
      horsesAffected: (n: number) => `${n} ${n === 1 ? 'حصان' : n === 2 ? 'حصانان' : 'خيول'}`,
      noneActive: 'لا يوجد علاج جارٍ',
      emptyTitle: 'لا توجد بيانات صحية بعد',
      emptyDescription: 'ستظهر هنا التطعيمات والزيارات والعلاجات بعد إضافة الخيول.',
      viewAllLabel: 'عرض كل السجلات الصحية',
    },
    tasks: {
      sectionTitle: 'المهام القادمة',
      emptyTitle: 'لا توجد مهام قادمة',
      emptyDescription: 'لا يوجد ما ينتظرك حاليًا.',
      viewAllLabel: 'عرض كل المهام',
    },
    notificationsPanel: {
      sectionTitle: 'الإشعارات الأخيرة',
      unread: 'غير مقروء',
      emptyTitle: 'لا توجد إشعارات حديثة',
      emptyDescription: 'لا يوجد ما ينتظرك حاليًا.',
      viewAllLabel: 'عرض كل الإشعارات',
    },
    sectionLink: { viewAll: 'عرض الكل' },
    smartActions: {
      sectionTitle: 'الإجراءات الذكية',
      sectionDescription: 'أبرز ما يستحق انتباهك الآن.',
      vaccinationsDue: (n: number) =>
        `${n} ${n === 1 ? 'حصان لديه' : n === 2 ? 'حصانان لديهما' : 'خيول لديها'} تطعيمات مستحقة هذا الأسبوع`,
      reviewHorses: 'مراجعة الخيول',
      tasksOverdue: (n: number) =>
        `${n} ${n === 1 ? 'مهمة تجاوزت' : n === 2 ? 'مهمتان تجاوزتا' : 'مهام تجاوزت'} موعدها`,
      viewTasks: 'عرض المهام',
      upcomingVisit: (dayLabel: string) => `هناك زيارة مجدولة ${dayLabel}`,
      openVisit: 'فتح الزيارة',
      allClear: 'كل شيء على ما يرام — لا يوجد ما يحتاج انتباهك الآن.',
    },
    loadingAnnouncement: 'جارٍ تحميل لوحة التحكم',
    errorDescription: 'حدث خطأ أثناء تحميل بيانات لوحة التحكم. تحقق من اتصالك وحاول مرة أخرى.',
    quickActions: {
      sectionTitle: 'إجراءات سريعة',
      addHorse: 'إضافة حصان',
      addTask: 'إضافة مهمة',
      viewNotifications: 'عرض الإشعارات',
    },
  },
  horses: {
    genderLabels: {
      mare: 'فرس',
      stallion: 'حصان فحل',
      gelding: 'حصان مخصي',
      filly: 'مهرة',
      colt: 'مهر',
    },
    statusLabels: {
      active: 'نشط',
      'in-training': 'قيد التدريب',
      resting: 'في راحة',
      sold: 'مُباع',
    },
    notProvided: 'غير مسجَّل',
    colorLabel: 'اللون',
    ownerLabel: 'المالك',
    unassigned: 'غير محدد',
    view: 'عرض',
    editHorse: 'تعديل بيانات الحصان',
    editHorseDescription: (name: string) => `تحديث بيانات ${name} وأوراقه الثبوتية.`,
    loadingHorse: 'جارٍ تحميل بيانات الحصان',
    nameLabel: 'الاسم',
    backToHorses: 'العودة إلى الخيل',
    searchLabel: 'ابحث عن حصان',
    searchPlaceholder: 'ابحث بالاسم أو السلالة أو الرقم',
    filters: 'الفلاتر',
    filterByBreed: 'التصفية حسب السلالة',
    filterByGender: 'التصفية حسب الجنس',
    filterByStatus: 'التصفية حسب الحالة',
    allBreeds: 'كل السلالات',
    allGenders: 'كل الأجناس',
    allStatuses: 'كل الحالات',
    clearFilters: 'مسح الفلاتر',
    table: {
      caption: 'خيول هذه المزرعة',
      horse: 'الحصان',
      breed: 'السلالة',
      gender: 'الجنس',
      age: 'العمر',
      owner: 'المالك',
      status: 'الحالة',
      actions: 'إجراءات',
      viewHorse: (name: string) => `عرض ${name}`,
    },
  },
  horseNames: {
    Luna: 'ليلى',
    Storm: 'برق',
    Bella: 'غزالة',
    Thunder: 'رعد',
    Sultan: 'سلطان',
    Nova: 'نجمة',
    Duke: 'فارس',
    Shadow: 'شاهين',
    Willow: 'سحاب',
    Amira: 'أميرة',
    Comet: 'شهاب',
    Zahra: 'زهراء',
    Rio: 'جواد',
    Maverick: 'عنتر',
    Pearl: 'لؤلؤة',
    Orion: 'النسر',
    Saffron: 'عنبر',
    Atlas: 'أطلس',
    Jasmine: 'ياسمين',
    Ranger: 'حارس',
    Mistral: 'نسيم',
    Kestrel: 'صقر',
    Basim: 'باسم',
    Aurora: 'فجر',
  } as Record<string, string>,
};
