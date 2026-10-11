import type { TranslationTable } from '../../translate';

/**
 * Health module demo content: record titles, clinical notes, medications and
 * vaccines, written as an Arabic-speaking equine vet would record them. Drug
 * names keep their international (generic) names, transliterated, with doses
 * in standard units — the way Arabic veterinary records are kept.
 */
export const arMedical: TranslationTable = {
  exact: {
    /* ---------------- Vaccines ---------------- */
    'Equine influenza': 'إنفلونزا الخيول',
    Tetanus: 'الكزاز',
    'Equine herpesvirus (EHV-1/4)': 'فيروس الهربس الخيلي (EHV-1/4)',
    'West Nile virus': 'فيروس غرب النيل',
    Rabies: 'داء الكلب',
    Strangles: 'خناق الخيل',

    /* ---------------- Record titles ---------------- */
    'Routine health examination': 'فحص صحي دوري',
    'Equine influenza booster': 'جرعة معززة ضد إنفلونزا الخيول',
    'Tetanus toxoid booster': 'جرعة معززة من ذوفان الكزاز',
    'Routine dental float': 'تسوية أسنان دورية',
    'Suspensory strain, right foreleg': 'إجهاد الرباط المعلّق، الطرف الأمامي الأيمن',
    'Rehabilitation programme': 'برنامج إعادة التأهيل',
    'Equine herpesvirus booster': 'جرعة معززة ضد فيروس الهربس الخيلي',
    'Pre-season examination': 'فحص ما قبل الموسم',
    'Dental and eye examination': 'فحص الأسنان والعينين',
    'Mild sweet itch': 'حكة صيفية خفيفة',
    'Health certificate and passport update': 'شهادة صحية وتحديث جواز السفر',
    'Hock osteoarthritis': 'التهاب مفصل العرقوب التنكسي',
    'Daily anti-inflammatory course': 'علاج يومي مضاد للالتهاب',
    'West Nile virus booster': 'جرعة معززة ضد فيروس غرب النيل',
    'Senior horse health check': 'فحص صحي للخيول المسنّة',
    'Pre-competition examination': 'فحص ما قبل المنافسة',
    'Routine worming': 'تجريع دوري ضد الديدان',
    'Suspected early laminitis': 'اشتباه في التهاب الصفائح الحافرية المبكر',
    'Weight and body condition check': 'فحص الوزن والحالة الجسدية',
    'Recurrent airway obstruction': 'انسداد المجاري التنفسية المتكرر',
    'Respiratory recheck': 'إعادة فحص الجهاز التنفسي',
    'Rabies vaccination': 'تطعيم ضد داء الكلب',
    'Routine examination': 'فحص دوري',
    'Superficial wound, left hind limb': 'جرح سطحي، الطرف الخلفي الأيسر',
    'Sarcoid removal, right flank': 'استئصال ورم ساركويد، الخاصرة اليمنى',
    'Post-operative antibiotics': 'مضادات حيوية بعد الجراحة',
    'Recurrent uveitis, left eye': 'التهاب العنبية المتكرر، العين اليسرى',
    'Eye examination': 'فحص العينين',
    'Tetanus toxoid, first dose': 'ذوفان الكزاز، الجرعة الأولى',
    'Foal worming': 'تجريع المهر ضد الديدان',
    'Foal health check': 'فحص صحي للمهر',
    'Strangles vaccination': 'تطعيم ضد خناق الخيل',
    'Pre-race examination': 'فحص ما قبل السباق',

    /* ---------------- Diagnoses ---------------- */
    'Mild strain of the right foreleg suspensory branch.':
      'إجهاد خفيف في فرع الرباط المعلّق بالطرف الأمامي الأيمن.',
    'Culicoides hypersensitivity (mild), mane and tail base.':
      'فرط حساسية من حشرة الكوليكويدس (خفيف) عند العُرف وقاعدة الذيل.',
    'Mild-to-moderate distal tarsal osteoarthritis, left hock.':
      'التهاب تنكسي خفيف إلى متوسط في مفاصل العرقوب السفلية، العرقوب الأيسر.',
    'Suspected early laminitis, both forefeet.':
      'اشتباه في التهاب الصفائح الحافرية المبكر في الحافرين الأماميين.',
    'Recurrent airway obstruction (mild).': 'انسداد المجاري التنفسية المتكرر (خفيف).',
    'Superficial laceration above the left hock.': 'تمزق سطحي فوق العرقوب الأيسر.',
    'Occult sarcoid, right flank (histology confirmed).':
      'ساركويد خفي في الخاصرة اليمنى (مؤكَّد بالفحص النسيجي).',
    'Equine recurrent uveitis, left eye (currently quiet).':
      'التهاب العنبية المتكرر لدى الخيول، العين اليسرى (هادئ حاليًا).',

    /* ---------------- Treatments ---------------- */
    'Sharp enamel points rasped on the upper cheek teeth.':
      'برد النتوءات الحادة في مينا الأضراس العلوية.',
    'Cold hosing twice daily and 10 days of box rest, then controlled hand-walking.':
      'تبريد بالماء مرتين يوميًا وراحة في الحظيرة لمدة 10 أيام، ثم مشي مقيّد باليد.',
    'Hand-walking 20 minutes twice daily, building to 30 minutes if the leg stays cool.':
      'مشي باليد لمدة 20 دقيقة مرتين يوميًا، تُزاد إلى 30 دقيقة إذا بقيت الساق باردة.',
    'Fly rug, and stabled at dawn and dusk while midges are active.':
      'غطاء واقٍ من الذباب، وإبقاؤه في الإسطبل عند الفجر والغسق أثناء نشاط البعوض الصغير.',
    'Intra-articular corticosteroid injection, then six weeks of controlled exercise.':
      'حقن كورتيكوستيرويد داخل المفصل، يليه ستة أسابيع من التمارين المقيّدة.',
    'Box rest on deep soft bedding, grazing restricted, frog support pads fitted.':
      'راحة في الحظيرة على فرشة عميقة وطرية، مع تقييد الرعي وتركيب وسائد دعم للنُّسور.',
    'Soaked hay, maximum turnout and dust-free bedding.':
      'دريس منقوع، وأطول فترة ممكنة في المرعى، وفرشة خالية من الغبار.',
    'Cleaned, flushed and left to heal open with daily dressings.':
      'تنظيف الجرح وغسله وتركه يلتئم مكشوفًا مع ضمادات يومية.',
    'Surgical excision under standing sedation and local anaesthetic; wound sutured.':
      'استئصال جراحي تحت التهدئة وقوفًا مع تخدير موضعي، وخياطة الجرح.',
    'Fly mask in turnout; topical atropine only if signs flare.':
      'قناع واقٍ من الذباب أثناء الرعي، وأتروبين موضعي فقط عند تجدد الأعراض.',
    'Cheek teeth rasped; wolf tooth on the right left in place.':
      'برد الأضراس، مع إبقاء ناب الذئب الأيمن في مكانه.',

    /* ---------------- Medications ---------------- */
    'Phenylbutazone 2 g twice daily for 5 days': 'فينيل بيوتازون 2 غ مرتين يوميًا لمدة 5 أيام',
    'Topical hydrocortisone cream once daily': 'كريم هيدروكورتيزون موضعي مرة يوميًا',
    'Firocoxib 57 mg once daily': 'فيروكوكسيب 57 ملغ مرة يوميًا',
    'Ivermectin paste, 1.8 g': 'معجون إيفرمكتين، 1.8 غ',
    'Phenylbutazone 1 g twice daily for 4 days': 'فينيل بيوتازون 1 غ مرتين يوميًا لمدة 4 أيام',
    'Inhaled fluticasone, twice daily': 'فلوتيكازون استنشاقي، مرتين يوميًا',
    'Trimethoprim-sulfadiazine, 7-day course': 'تريميثوبريم-سلفاديازين، علاج لمدة 7 أيام',
    'Fenbendazole 10 mg/kg': 'فينبندازول 10 ملغ/كغ',

    /* ---------------- Notes ---------------- */
    'Body condition 5/9. Resting heart rate 34 bpm. Teeth and hooves in good order.':
      'الحالة الجسدية 5/9. معدل نبض القلب أثناء الراحة 34 نبضة/دقيقة. الأسنان والحوافر في حالة جيدة.',
    'Batch EI-4471, left neck. No reaction at the 24-hour check.':
      'التشغيلة EI-4471، في الجانب الأيسر من الرقبة. لا يوجد أي تفاعل عند فحص الـ24 ساعة.',
    "Noticed after Tuesday's gallop: heat and swelling, no wound.":
      'لوحظ بعد عدو يوم الثلاثاء: سخونة وتورم، دون جرح.',
    'Fit to start the season. Recommended a four-week build-up.':
      'لائق لبدء الموسم. يوصى بفترة تهيئة تدريجية لمدة أربعة أسابيع.',
    'Booked after the owner noticed head-shaking on the lunge.':
      'حُجز الموعد بعد أن لاحظ المالك هزّ الرأس أثناء التدريب بالحبل.',
    'Passport updated ahead of the spring show season.':
      'تم تحديث جواز السفر استعدادًا لموسم عروض الربيع.',
    'Lameness grade 2/5 on the left hind at trot; positive to flexion test.':
      'عرج بدرجة 2/5 في الطرف الخلفي الأيسر أثناء الخبب، مع نتيجة إيجابية لاختبار الثني.',
    'Weight steady at 540 kg. Blood values normal for age.':
      'الوزن مستقر عند 540 كغ. قيم الدم طبيعية بالنسبة للعمر.',
    'Sound at walk and trot. Cleared for the November three-day event.':
      'سليم الحركة في المشي والخبب. مُجاز للمشاركة في منافسة الأيام الثلاثة في نوفمبر.',
    'Faecal egg count of 250 epg before dosing. Given by yard staff.':
      'عدد البيض في الروث 250 بيضة/غرام قبل التجريع. أعطاه فريق الإسطبل.',
    'Increased digital pulses and mild lameness on hard ground. Weight above target.':
      'ازدياد نبض الشرايين الرقمية وعرج خفيف على الأرض الصلبة. الوزن أعلى من المستهدف.',
    'Body condition 7/9, above target. Diet plan reduced.':
      'الحالة الجسدية 7/9، أعلى من المستهدف. تم تقليل الخطة الغذائية.',
    'Booked ahead of the due date.': 'حُجز قبل موعد الاستحقاق.',
    'Cough reduced. Mucus score improved from 3 to 2.':
      'انخفض السعال. تحسّن مؤشر المخاط من 3 إلى 2.',
    'Course completed with no adverse reactions.': 'اكتمل العلاج دون أي آثار جانبية.',
    'No active inflammation. Pupil response normal.': 'لا يوجد التهاب نشط. استجابة البؤبؤ طبيعية.',
    'Primary course: the second dose is due four weeks after the first.':
      'الجرعات الأساسية: تُستحق الجرعة الثانية بعد أربعة أسابيع من الأولى.',
    'Growing well. Hooves trimmed evenly.': 'ينمو بشكل جيد. تم تقليم الحوافر بشكل متساوٍ.',
    'Fit to work. Slight stiffness on the right rein; keep an eye on it.':
      'لائق للعمل. تيبّس طفيف عند الدوران يمينًا، تجب مراقبته.',

    /* ---------------- Follow-up notes ---------------- */
    'Repeat ultrasound. Clear for trot work only if fibre alignment has improved.':
      'إعادة الفحص بالموجات فوق الصوتية. يُسمح بالخبب فقط إذا تحسّن اصطفاف الألياف.',
    'Review the skin and decide whether the cream can stop.':
      'مراجعة حالة الجلد وتقرير ما إذا كان يمكن إيقاف الكريم.',
    'Review the response and decide whether to step the dose down.':
      'مراجعة الاستجابة وتقرير ما إذا كان يمكن تخفيض الجرعة.',
    'Repeat the lameness examination and review the hoof radiographs.':
      'إعادة فحص العرج ومراجعة صور الأشعة للحوافر.',
    'Repeat endoscopy before reducing the inhaled dose.':
      'إعادة التنظير الداخلي قبل تخفيض الجرعة الاستنشاقية.',
    'Suture removal and wound check.': 'إزالة الغرز وفحص الجرح.',
    'Six-monthly eye examination.': 'فحص العينين كل ستة أشهر.',

    /* ---------------- Health-status notes ---------------- */
    'Walking only until the recheck on the leg.': 'المشي فقط حتى إعادة فحص الساق.',
    'Dental and eye examination booked for tomorrow.': 'فحص الأسنان والعينين محجوز غدًا.',
    'On a daily anti-inflammatory; review due soon.':
      'يتلقى علاجًا يوميًا مضادًا للالتهاب، والمراجعة قريبة.',
    'Suspected laminitis. Box rest until the recheck.':
      'اشتباه في التهاب الصفائح الحافرية. راحة في الحظيرة حتى إعادة الفحص.',
    'Managing airway obstruction; endoscopy recheck planned.':
      'متابعة انسداد المجاري التنفسية، مع إعادة تنظير مخطط لها.',
    'Wound healing well after surgery.': 'الجرح يلتئم جيدًا بعد الجراحة.',
    'Left eye quiet. Six-monthly checks.': 'العين اليسرى هادئة. فحوصات كل ستة أشهر.',
    'Second tetanus dose is overdue.': 'الجرعة الثانية من لقاح الكزاز متأخرة.',
  },
  patterns: [
    // Upcoming events the service composes from records (see `mock/derive.ts`).
    { pattern: /^Follow-up: (.+)$/, render: (m, tr) => `متابعة: ${tr(m[1] ?? '')}` },
    { pattern: /^Review: (.+)$/, render: (m, tr) => `مراجعة: ${tr(m[1] ?? '')}` },
    {
      pattern: /^(.+) booster due$/,
      render: (m, tr) => `موعد الجرعة المعززة من لقاح ${tr(m[1] ?? '')}`,
    },
  ],
};
