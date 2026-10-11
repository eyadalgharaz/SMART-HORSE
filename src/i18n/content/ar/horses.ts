import type { TranslationTable } from '../../translate';

/**
 * Horse vocabulary stored as data: breed names and coat colours. Breeds keep
 * their internationally recognised names (transliterated, as Arabic studbooks
 * write them); coat colours use the traditional Arabic horse-colour terms.
 * The stored English value never changes — filters and records keep matching
 * across languages.
 */
export const arHorseVocabulary: TranslationTable = {
  exact: {
    // Breeds
    'Akhal-Teke': 'أخال تيكي',
    Andalusian: 'أندلسي',
    Appaloosa: 'أبالوسا',
    Arabian: 'عربي أصيل',
    Connemara: 'كونيمارا',
    Friesian: 'فريزيان',
    Hanoverian: 'هانوفيري',
    Holsteiner: 'هولشتاينر',
    Lusitano: 'لوسيتانو',
    'Quarter Horse': 'كوارتر هورس',
    Shire: 'شاير',
    Standardbred: 'ستاندرد بريد',
    Thoroughbred: 'ثوروبريد',
    Trakehner: 'تراكينر',
    'Welsh Pony': 'مهر ويلزي',

    // Coat colours
    Grey: 'أشهب',
    Gray: 'أشهب',
    Chestnut: 'أشقر',
    Black: 'أدهم',
    Bay: 'أحمر',
    'Dark bay': 'أحمر داكن',
    Sorrel: 'أشقر فاتح',
    Palomino: 'بالومينو',
    'Leopard spotted': 'مرقّط',
    Dun: 'أغبر',
    Cremello: 'كريميلو',
    Buckskin: 'أصفر بعُرف أسود',
    Brown: 'بنّي',
    White: 'أبيض',
    Roan: 'أمغر',
    Pinto: 'أبلق',
  },
};
