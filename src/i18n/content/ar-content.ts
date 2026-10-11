import type { TranslationTable } from '../translate';
import { arFarm } from './ar/farm';
import { arHorseVocabulary } from './ar/horses';
import { arMedical } from './ar/medical';
import { arNotifications } from './ar/notifications';
import { arPeople } from './ar/people';
import { arTasks } from './ar/tasks';
import { arTraining } from './ar/training';

/**
 * Arabic for the demo data the mock services return, grouped by module in
 * `./ar/`. Anything not listed — above all, anything a person types into the
 * app themselves — is displayed exactly as entered.
 */
const tables = [
  arPeople,
  arHorseVocabulary,
  arFarm,
  arMedical,
  arTraining,
  arTasks,
  arNotifications,
];

export const arContent: TranslationTable = {
  exact: Object.assign({}, ...tables.map((table) => table.exact)),
  patterns: tables.flatMap((table) => table.patterns ?? []),
};
