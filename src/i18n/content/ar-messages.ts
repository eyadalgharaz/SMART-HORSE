import type { TranslationTable } from '../translate';

/**
 * Arabic for system messages: form validation (the Zod schemas keep their
 * English source text) and the errors services return. Written as an Arabic
 * product would phrase them — direct, polite imperatives — not word-for-word.
 */
export const arMessages: TranslationTable = {
  exact: {
    /* ---------------- Shared validation ---------------- */
    'Enter a valid date.': 'أدخل تاريخًا صحيحًا.',
    'Enter the date.': 'أدخل التاريخ.',
    'Choose a status.': 'اختر الحالة.',
    'Enter a short title (at least 3 characters).': 'أدخل عنوانًا قصيرًا (3 أحرف على الأقل).',
    'Enter a valid email address.': 'أدخل بريدًا إلكترونيًا صحيحًا.',
    'Enter a valid phone number.': 'أدخل رقم هاتف صحيحًا.',
    'Enter a valid website address, e.g. https://example.com.':
      'أدخل عنوان موقع إلكتروني صحيحًا، مثل https://example.com.',
    'Passwords do not match.': 'كلمتا المرور غير متطابقتين.',
    'Use at least 8 characters.': 'استخدم 8 أحرف على الأقل.',
    'Include at least one letter.': 'يجب أن تحتوي على حرف واحد على الأقل.',
    'Include at least one number.': 'يجب أن تحتوي على رقم واحد على الأقل.',

    /* ---------------- Authentication ---------------- */
    'Enter your email address.': 'أدخل بريدك الإلكتروني.',
    'Enter your password.': 'أدخل كلمة المرور.',
    'Enter your full name.': 'أدخل اسمك الكامل.',
    'Re-enter your password.': 'أعد إدخال كلمة المرور.',
    'Choose your role.': 'اختر دورك الوظيفي.',
    'Email or password is incorrect.': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'That account is locked. Ask your farm owner to restore access.':
      'هذا الحساب مقفل. اطلب من مالك المزرعة استعادة صلاحية الدخول.',
    'An account already uses this email address.': 'يوجد حساب مسجّل بهذا البريد الإلكتروني بالفعل.',
    'This reset link has expired. Request a new one.':
      'انتهت صلاحية رابط إعادة التعيين. اطلب رابطًا جديدًا.',

    /* ---------------- Horses ---------------- */
    'Enter the horse’s name.': 'أدخل اسم الحصان.',
    'Choose a breed.': 'اختر السلالة.',
    'Enter a birth date.': 'أدخل تاريخ الميلاد.',
    'A birth date cannot be in the future.': 'لا يمكن أن يكون تاريخ الميلاد في المستقبل.',
    'Enter the coat color.': 'أدخل لون الحصان.',

    /* ---------------- Health ---------------- */
    'Choose a record type.': 'اختر نوع السجل.',
    'A scheduled record needs a date of today or later.':
      'يجب أن يكون تاريخ السجل المجدول اليوم أو بعده.',
    "A record that has already happened can't be dated in the future. Choose Scheduled for an upcoming visit.":
      'لا يمكن تحديد تاريخ مستقبلي لسجل تم بالفعل. اختر الحالة «مجدول» للزيارات القادمة.',
    "The follow-up can't be before the record date.": 'لا يمكن أن تسبق المتابعة تاريخ السجل.',
    'Set a follow-up date, or change the status.': 'حدّد تاريخ المتابعة، أو غيّر الحالة.',
    'Enter the vaccine name.': 'أدخل اسم اللقاح.',
    'The next dose must fall after this one.': 'يجب أن يكون موعد الجرعة التالية بعد هذه الجرعة.',

    /* ---------------- Training ---------------- */
    'Choose a training type.': 'اختر نوع التدريب.',
    'Enter a start time.': 'أدخل وقت البدء.',
    'Choose a trainer.': 'اختر المدرب.',
    'A scheduled session needs a date of today or later.':
      'يجب أن يكون تاريخ الجلسة المجدولة اليوم أو بعده.',
    "A completed or cancelled session can't be dated in the future.":
      'لا يمكن تحديد تاريخ مستقبلي لجلسة مكتملة أو ملغاة.',
    "Maximum speed can't be lower than the average speed.":
      'لا يمكن أن تكون السرعة القصوى أقل من متوسط السرعة.',
    'Enter duration.': 'أدخل المدة.',
    'Enter a valid number for duration.': 'أدخل رقمًا صحيحًا للمدة.',
    'Enter a valid number for distance.': 'أدخل رقمًا صحيحًا للمسافة.',
    'Enter a valid number for average speed.': 'أدخل رقمًا صحيحًا لمتوسط السرعة.',
    'Enter a valid number for maximum speed.': 'أدخل رقمًا صحيحًا للسرعة القصوى.',

    /* ---------------- Tasks ---------------- */
    'Choose a category.': 'اختر الفئة.',
    'Choose a priority.': 'اختر الأولوية.',
    'Choose how often this repeats.': 'اختر معدل التكرار.',
    'A repeating task needs a starting due date.': 'تحتاج المهمة المتكررة إلى تاريخ استحقاق للبدء.',
    'Enter a due time, or clear the due date.': 'أدخل وقت الاستحقاق، أو امسح تاريخ الاستحقاق.',

    /* ---------------- Settings ---------------- */
    'Enter the farm name.': 'أدخل اسم المزرعة.',
    'Choose a farm type.': 'اختر نوع المزرعة.',
    'Enter their full name.': 'أدخل الاسم الكامل.',
    'Enter an email address.': 'أدخل البريد الإلكتروني.',
    'Choose a role.': 'اختر الدور.',
    'Enter your current password.': 'أدخل كلمة المرور الحالية.',
    'Re-enter your new password.': 'أعد إدخال كلمة المرور الجديدة.',
    'Choose a password different from your current one.':
      'اختر كلمة مرور مختلفة عن كلمة المرور الحالية.',
    'Your current password is incorrect.': 'كلمة المرور الحالية غير صحيحة.',
    'No account is signed in.': 'لا يوجد حساب مسجّل الدخول.',

    /* ---------------- Service errors ---------------- */
    'The account could not be loaded.': 'تعذّر تحميل الحساب.',
    'The dashboard data could not be loaded.': 'تعذّر تحميل بيانات لوحة التحكم.',
    'The farm profile could not be loaded.': 'تعذّر تحميل ملف المزرعة.',
    'The horse records could not be loaded.': 'تعذّر تحميل سجلات الخيول.',
    'The medical records could not be loaded.': 'تعذّر تحميل السجلات الطبية.',
    'The notifications could not be loaded.': 'تعذّر تحميل الإشعارات.',
    'The roles could not be loaded.': 'تعذّر تحميل الأدوار.',
    'The tasks could not be loaded.': 'تعذّر تحميل المهام.',
    'The team could not be loaded.': 'تعذّر تحميل فريق العمل.',
    'The training data could not be loaded.': 'تعذّر تحميل بيانات التدريب.',
  },
  patterns: [
    {
      pattern: /^Use (\d+) characters or fewer\.$/,
      render: (m) => `استخدم ${m[1]} حرفًا أو أقل.`,
    },
    {
      pattern: /^Enter a birth date from (\d+) onwards\.$/,
      render: (m) => `أدخل تاريخ ميلاد من عام ${m[1]} فصاعدًا.`,
    },
    {
      pattern: /^A microchip number is (\d+) digits\.$/,
      render: (m) => `يتكون رقم الشريحة الإلكترونية من ${m[1]} رقمًا.`,
    },
    {
      pattern:
        /^(Duration|Distance|Average speed|Maximum speed) must be between (\d+) and (\d+)\.$/,
      render: (m) => {
        const field: Record<string, string> = {
          Duration: 'المدة',
          Distance: 'المسافة',
          'Average speed': 'متوسط السرعة',
          'Maximum speed': 'السرعة القصوى',
        };
        return `يجب أن تكون قيمة ${field[m[1] ?? ''] ?? m[1]} بين ${m[2]} و${m[3]}.`;
      },
    },
    {
      pattern:
        /^No (?:horse|medical record|training session|task|notification|team member) with id "(.+)"\.$/,
      render: () => 'العنصر المطلوب غير موجود.',
    },
  ],
};
