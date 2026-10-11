import type { TranslationTable } from '../../translate';

/**
 * The demo farm's people — owners, veterinarians, trainers and staff — as
 * an Arabic reader would write their names, plus the job titles shown next
 * to them. Real accounts (anyone who registers) are never in this list, so
 * their names always appear exactly as they typed them.
 */
export const arPeople: TranslationTable = {
  exact: {
    // Horse owners
    'Ahmed Hassan': 'أحمد حسن',
    'Nadia Farouk': 'نادية فاروق',
    'Khaled Mansour': 'خالد منصور',

    // Veterinarians
    'Dr. Ahmed Samir': 'د. أحمد سمير',
    'Dr. Sara Nabil': 'د. سارة نبيل',
    'Dr. Omar Fathy': 'د. عمر فتحي',
    'Dr. Layla Mostafa': 'د. ليلى مصطفى',

    // Trainers
    'Farida El-Sayed': 'فريدة السيد',
    'Omar Khalil': 'عمر خليل',
    'Mona Reda': 'منى رضا',
    'Hassan Ibrahim': 'حسن إبراهيم',
    'Lina Aziz': 'لينا عزيز',
    'Unknown trainer': 'مدرب غير معروف',

    // Staff and team
    'Yara Mostafa': 'يارا مصطفى',
    'Mostafa Adel': 'مصطفى عادل',
    'Salma Youssef': 'سلمى يوسف',
    'Tarek Nassar': 'طارق نصار',
    'Hoda Kamal': 'هدى كمال',
    'Dina Farouk': 'دينا فاروق',
    'Karim Abdallah': 'كريم عبد الله',

    // Job titles (task assignees)
    'Stable Hand': 'سائس',
    'Vet Tech': 'فني بيطري',
    'Farm Manager': 'مدير المزرعة',
    Worker: 'عامل',
  },
};
