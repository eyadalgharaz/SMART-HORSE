import { buildHorseMocks } from '@/features/horses/mock/horse-mock-data';
import type {
  AttachmentType,
  HealthStatus,
  HorseHealth,
  MedicalAttachment,
  MedicalRecord,
  MedicalRecordStatus,
  MedicalRecordType,
} from '../types';

/**
 * Realistic sample medical history for the same stable the Horses module uses.
 *
 * Every record points at a real horse id from `buildHorseMocks()` and takes the
 * horse's name from it, so Medical can never disagree with Horse Management
 * about who a horse is. Horses that have no medical data on purpose (the sold
 * horses, some youngsters) are what make the "no records for this horse" state
 * reviewable without editing code.
 *
 * Every date is an offset in days from `now`, so "overdue", "due soon" and
 * "tomorrow" stay true whenever the page is opened. The set is deliberately
 * uneven: every record type and status, four veterinarians, records with no vet,
 * no diagnosis or no notes, attachments on some and not others, and at least one
 * vaccination in each of the four vaccination states. That is what makes search,
 * filters, badges and fallbacks reviewable.
 *
 * This file is fake data only — nothing here implies a backend exists.
 */

const AHMED = 'Dr. Ahmed Samir';
const SARA = 'Dr. Sara Nabil';
const OMAR = 'Dr. Omar Fathy';
const LAYLA = 'Dr. Layla Mostafa';

const HOUR_MS = 3_600_000;

/** Local calendar day `offset` days from `now`, at the given clock time. */
function at(now: Date, offset: number, hour = 9, minute = 0): string {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + offset,
    hour,
    minute,
  ).toISOString();
}

function file(
  now: Date,
  id: string,
  fileName: string,
  type: AttachmentType,
  sizeBytes: number,
  addedOffset: number,
): MedicalAttachment {
  return { id, fileName, type, sizeBytes, addedAt: at(now, addedOffset, 11, 20) };
}

interface Seed {
  id: string;
  horseId: string;
  recordType: MedicalRecordType;
  /** Days from today; negative is the past. */
  offset: number;
  hour?: number;
  minute?: number;
  title: string;
  status?: MedicalRecordStatus;
  veterinarian?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  medication?: string | null;
  notes?: string | null;
  followUpOffset?: number;
  followUpNotes?: string | null;
  vaccine?: { name: string; nextDueOffset: number | null };
  attachments?: (now: Date) => MedicalAttachment[];
}

const seeds: Seed[] = [
  /* ------------------------------ Luna — healthy ------------------------------ */
  {
    id: 'mr-001',
    horseId: 'luna',
    recordType: 'checkup',
    offset: -12,
    title: 'Routine health examination',
    veterinarian: SARA,
    notes: 'Body condition 5/9. Resting heart rate 34 bpm. Teeth and hooves in good order.',
  },
  {
    id: 'mr-002',
    horseId: 'luna',
    recordType: 'vaccination',
    offset: -186,
    title: 'Equine influenza booster',
    veterinarian: AHMED,
    vaccine: { name: 'Equine influenza', nextDueOffset: 0 },
    notes: 'Batch EI-4471, left neck. No reaction at the 24-hour check.',
  },
  {
    id: 'mr-003',
    horseId: 'luna',
    recordType: 'vaccination',
    offset: -551,
    title: 'Equine influenza booster',
    veterinarian: AHMED,
    vaccine: { name: 'Equine influenza', nextDueOffset: -186 },
  },
  {
    id: 'mr-004',
    horseId: 'luna',
    recordType: 'vaccination',
    offset: -60,
    title: 'Tetanus toxoid booster',
    veterinarian: SARA,
    vaccine: { name: 'Tetanus', nextDueOffset: 670 },
  },
  {
    id: 'mr-005',
    horseId: 'luna',
    recordType: 'treatment',
    offset: -95,
    title: 'Routine dental float',
    veterinarian: LAYLA,
    treatment: 'Sharp enamel points rasped on the upper cheek teeth.',
  },

  /* ------------------------------ Storm — recovering ------------------------------ */
  {
    id: 'mr-006',
    horseId: 'storm',
    recordType: 'injury',
    offset: -26,
    title: 'Suspensory strain, right foreleg',
    veterinarian: AHMED,
    diagnosis: 'Mild strain of the right foreleg suspensory branch.',
    treatment: 'Cold hosing twice daily and 10 days of box rest, then controlled hand-walking.',
    medication: 'Phenylbutazone 2 g twice daily for 5 days',
    notes: 'Noticed after Tuesday’s gallop: heat and swelling, no wound.',
    attachments: (now) => [
      file(now, 'att-006-a', 'ultrasound-right-fore-suspensory.jpg', 'image', 1_860_000, -26),
      file(now, 'att-006-b', 'ultrasound-report-storm.pdf', 'document', 245_000, -25),
    ],
  },
  {
    id: 'mr-007',
    horseId: 'storm',
    recordType: 'treatment',
    offset: -18,
    title: 'Rehabilitation programme',
    status: 'follow-up-required',
    veterinarian: AHMED,
    treatment: 'Hand-walking 20 minutes twice daily, building to 30 minutes if the leg stays cool.',
    followUpOffset: 4,
    followUpNotes: 'Repeat ultrasound. Clear for trot work only if fibre alignment has improved.',
  },
  {
    id: 'mr-008',
    horseId: 'storm',
    recordType: 'vaccination',
    offset: -340,
    title: 'Equine influenza booster',
    veterinarian: SARA,
    vaccine: { name: 'Equine influenza', nextDueOffset: 25 },
  },
  {
    id: 'mr-009',
    horseId: 'storm',
    recordType: 'vaccination',
    offset: -140,
    title: 'Equine herpesvirus booster',
    veterinarian: SARA,
    vaccine: { name: 'Equine herpesvirus (EHV-1/4)', nextDueOffset: 42 },
  },
  {
    id: 'mr-010',
    horseId: 'storm',
    recordType: 'checkup',
    offset: -150,
    title: 'Pre-season examination',
    veterinarian: SARA,
    notes: 'Fit to start the season. Recommended a four-week build-up.',
  },

  /* ------------------------------ Thunder — monitoring ------------------------------ */
  {
    id: 'mr-011',
    horseId: 'thunder',
    recordType: 'checkup',
    offset: 1,
    hour: 9,
    minute: 30,
    title: 'Dental and eye examination',
    status: 'scheduled',
    veterinarian: SARA,
    notes: 'Booked after the owner noticed head-shaking on the lunge.',
  },
  {
    id: 'mr-012',
    horseId: 'thunder',
    recordType: 'diagnosis',
    offset: -35,
    title: 'Mild sweet itch',
    status: 'ongoing',
    veterinarian: AHMED,
    diagnosis: 'Culicoides hypersensitivity (mild), mane and tail base.',
    treatment: 'Fly rug, and stabled at dawn and dusk while midges are active.',
    medication: 'Topical hydrocortisone cream once daily',
    followUpOffset: 20,
    followUpNotes: 'Review the skin and decide whether the cream can stop.',
  },
  {
    id: 'mr-013',
    horseId: 'thunder',
    recordType: 'vaccination',
    offset: -50,
    title: 'Equine influenza booster',
    veterinarian: AHMED,
    vaccine: { name: 'Equine influenza', nextDueOffset: 315 },
  },
  {
    id: 'mr-014',
    horseId: 'thunder',
    recordType: 'other',
    offset: -110,
    title: 'Health certificate and passport update',
    veterinarian: AHMED,
    notes: 'Passport updated ahead of the spring show season.',
    attachments: (now) => [
      file(now, 'att-014-a', 'health-certificate-thunder.pdf', 'document', 182_000, -110),
    ],
  },

  /* ------------------------------ Duke — under treatment ------------------------------ */
  {
    id: 'mr-015',
    horseId: 'duke',
    recordType: 'diagnosis',
    offset: -70,
    title: 'Hock osteoarthritis',
    status: 'ongoing',
    veterinarian: OMAR,
    diagnosis: 'Mild-to-moderate distal tarsal osteoarthritis, left hock.',
    treatment: 'Intra-articular corticosteroid injection, then six weeks of controlled exercise.',
    notes: 'Lameness grade 2/5 on the left hind at trot; positive to flexion test.',
    attachments: (now) => [
      file(now, 'att-015-a', 'left-hock-lateral-xray.jpg', 'x-ray', 3_240_000, -70),
      file(now, 'att-015-b', 'left-hock-dorsoplantar-xray.jpg', 'x-ray', 2_910_000, -70),
      file(now, 'att-015-c', 'radiology-report-duke.pdf', 'document', 412_000, -69),
    ],
  },
  {
    id: 'mr-016',
    horseId: 'duke',
    recordType: 'medication',
    offset: -45,
    title: 'Daily anti-inflammatory course',
    status: 'ongoing',
    veterinarian: OMAR,
    medication: 'Firocoxib 57 mg once daily',
    followUpOffset: 9,
    followUpNotes: 'Review the response and decide whether to step the dose down.',
  },
  {
    id: 'mr-017',
    horseId: 'duke',
    recordType: 'vaccination',
    offset: -400,
    title: 'West Nile virus booster',
    veterinarian: SARA,
    vaccine: { name: 'West Nile virus', nextDueOffset: -35 },
  },
  {
    id: 'mr-018',
    horseId: 'duke',
    recordType: 'checkup',
    offset: -190,
    title: 'Senior horse health check',
    veterinarian: SARA,
    notes: 'Weight steady at 540 kg. Blood values normal for age.',
    attachments: (now) => [
      file(now, 'att-018-a', 'duke-blood-panel.pdf', 'lab-result', 96_000, -189),
    ],
  },

  /* ------------------------------ Shadow — healthy ------------------------------ */
  {
    id: 'mr-019',
    horseId: 'shadow',
    recordType: 'checkup',
    offset: -40,
    title: 'Pre-competition examination',
    veterinarian: SARA,
    notes: 'Sound at walk and trot. Cleared for the November three-day event.',
  },
  {
    id: 'mr-020',
    horseId: 'shadow',
    recordType: 'vaccination',
    offset: -120,
    title: 'Equine influenza booster',
    veterinarian: AHMED,
    vaccine: { name: 'Equine influenza', nextDueOffset: 245 },
  },
  {
    id: 'mr-021',
    horseId: 'shadow',
    recordType: 'medication',
    offset: -14,
    title: 'Routine worming',
    veterinarian: null,
    medication: 'Ivermectin paste, 1.8 g',
    notes: 'Faecal egg count of 250 epg before dosing. Given by yard staff.',
  },

  /* ------------------------------ Willow — needs attention ------------------------------ */
  {
    id: 'mr-022',
    horseId: 'willow',
    recordType: 'diagnosis',
    offset: -8,
    title: 'Suspected early laminitis',
    status: 'follow-up-required',
    veterinarian: AHMED,
    diagnosis: 'Suspected early laminitis, both forefeet.',
    treatment: 'Box rest on deep soft bedding, grazing restricted, frog support pads fitted.',
    medication: 'Phenylbutazone 1 g twice daily for 4 days',
    notes: 'Increased digital pulses and mild lameness on hard ground. Weight above target.',
    followUpOffset: 2,
    followUpNotes: 'Repeat the lameness examination and review the hoof radiographs.',
    attachments: (now) => [
      file(now, 'att-022-a', 'willow-hoof-lateral-xray.jpg', 'x-ray', 2_430_000, -8),
      file(now, 'att-022-b', 'willow-blood-panel.pdf', 'lab-result', 121_000, -7),
    ],
  },
  {
    id: 'mr-023',
    horseId: 'willow',
    recordType: 'checkup',
    offset: -75,
    title: 'Weight and body condition check',
    veterinarian: SARA,
    notes: 'Body condition 7/9, above target. Diet plan reduced.',
  },
  {
    id: 'mr-024',
    horseId: 'willow',
    recordType: 'vaccination',
    offset: -358,
    title: 'Equine influenza booster',
    veterinarian: AHMED,
    vaccine: { name: 'Equine influenza', nextDueOffset: 7 },
  },
  {
    id: 'mr-025',
    horseId: 'willow',
    recordType: 'vaccination',
    offset: 5,
    title: 'Equine influenza booster',
    status: 'scheduled',
    veterinarian: AHMED,
    vaccine: { name: 'Equine influenza', nextDueOffset: null },
    notes: 'Booked ahead of the due date.',
  },

  /* ------------------------------ Bella — under treatment ------------------------------ */
  {
    id: 'mr-026',
    horseId: 'bella',
    recordType: 'diagnosis',
    offset: -55,
    title: 'Recurrent airway obstruction',
    status: 'ongoing',
    veterinarian: OMAR,
    diagnosis: 'Recurrent airway obstruction (mild).',
    treatment: 'Soaked hay, maximum turnout and dust-free bedding.',
    medication: 'Inhaled fluticasone, twice daily',
    attachments: (now) => [
      file(now, 'att-026-a', 'bella-endoscopy-report.pdf', 'document', 521_000, -55),
    ],
  },
  {
    id: 'mr-027',
    horseId: 'bella',
    recordType: 'checkup',
    offset: -14,
    title: 'Respiratory recheck',
    status: 'follow-up-required',
    veterinarian: OMAR,
    notes: 'Cough reduced. Mucus score improved from 3 to 2.',
    followUpOffset: 21,
    followUpNotes: 'Repeat endoscopy before reducing the inhaled dose.',
  },
  {
    id: 'mr-028',
    horseId: 'bella',
    recordType: 'vaccination',
    offset: -200,
    title: 'Rabies vaccination',
    veterinarian: SARA,
    vaccine: { name: 'Rabies', nextDueOffset: 165 },
  },

  /* ------------------------------ Sultan — monitoring ------------------------------ */
  {
    id: 'mr-029',
    horseId: 'sultan',
    recordType: 'checkup',
    offset: -60,
    title: 'Routine examination',
    veterinarian: SARA,
  },
  {
    id: 'mr-030',
    horseId: 'sultan',
    recordType: 'injury',
    offset: -160,
    title: 'Superficial wound, left hind limb',
    veterinarian: LAYLA,
    diagnosis: 'Superficial laceration above the left hock.',
    treatment: 'Cleaned, flushed and left to heal open with daily dressings.',
  },
  {
    id: 'mr-031',
    horseId: 'sultan',
    recordType: 'vaccination',
    offset: -150,
    title: 'Tetanus toxoid booster',
    veterinarian: SARA,
    vaccine: { name: 'Tetanus', nextDueOffset: 580 },
  },

  /* ------------------------------ Amira — recovering ------------------------------ */
  {
    id: 'mr-032',
    horseId: 'amira',
    recordType: 'surgery',
    offset: -22,
    title: 'Sarcoid removal, right flank',
    status: 'follow-up-required',
    veterinarian: LAYLA,
    diagnosis: 'Occult sarcoid, right flank (histology confirmed).',
    treatment: 'Surgical excision under standing sedation and local anaesthetic; wound sutured.',
    followUpOffset: 7,
    followUpNotes: 'Suture removal and wound check.',
    attachments: (now) => [
      file(now, 'att-032-a', 'amira-histology-report.pdf', 'lab-result', 311_000, -19),
      file(now, 'att-032-b', 'amira-surgical-site.jpg', 'image', 1_140_000, -22),
    ],
  },
  {
    id: 'mr-033',
    horseId: 'amira',
    recordType: 'medication',
    offset: -21,
    title: 'Post-operative antibiotics',
    veterinarian: LAYLA,
    medication: 'Trimethoprim-sulfadiazine, 7-day course',
    notes: 'Course completed with no adverse reactions.',
  },
  {
    id: 'mr-034',
    horseId: 'amira',
    recordType: 'vaccination',
    offset: -280,
    title: 'Equine influenza booster',
    veterinarian: AHMED,
    vaccine: { name: 'Equine influenza', nextDueOffset: 85 },
  },

  /* ------------------------------ Comet — monitoring ------------------------------ */
  {
    id: 'mr-035',
    horseId: 'comet',
    recordType: 'diagnosis',
    offset: -100,
    title: 'Recurrent uveitis, left eye',
    status: 'ongoing',
    veterinarian: OMAR,
    diagnosis: 'Equine recurrent uveitis, left eye (currently quiet).',
    treatment: 'Fly mask in turnout; topical atropine only if signs flare.',
    followUpOffset: 40,
    followUpNotes: 'Six-monthly eye examination.',
  },
  {
    id: 'mr-036',
    horseId: 'comet',
    recordType: 'vaccination',
    offset: -300,
    title: 'Equine influenza booster',
    veterinarian: SARA,
    vaccine: { name: 'Equine influenza', nextDueOffset: 65 },
  },
  {
    id: 'mr-037',
    horseId: 'comet',
    recordType: 'checkup',
    offset: -20,
    title: 'Eye examination',
    veterinarian: OMAR,
    notes: 'No active inflammation. Pupil response normal.',
  },

  /* ------------------------------ Zahra — foal ------------------------------ */
  {
    id: 'mr-038',
    horseId: 'zahra',
    recordType: 'vaccination',
    offset: -45,
    title: 'Tetanus toxoid, first dose',
    veterinarian: SARA,
    vaccine: { name: 'Tetanus', nextDueOffset: -10 },
    notes: 'Primary course: the second dose is due four weeks after the first.',
  },
  {
    id: 'mr-039',
    horseId: 'zahra',
    recordType: 'medication',
    offset: -60,
    title: 'Foal worming',
    veterinarian: null,
    medication: 'Fenbendazole 10 mg/kg',
  },
  {
    id: 'mr-040',
    horseId: 'zahra',
    recordType: 'checkup',
    offset: -90,
    title: 'Foal health check',
    veterinarian: AHMED,
    notes: 'Growing well. Hooves trimmed evenly.',
  },

  /* ------------------------------ Nova, Saffron, Jasmine ------------------------------ */
  {
    id: 'mr-041',
    horseId: 'nova',
    recordType: 'vaccination',
    offset: -90,
    title: 'Equine influenza booster',
    veterinarian: AHMED,
    vaccine: { name: 'Equine influenza', nextDueOffset: 275 },
  },
  {
    id: 'mr-042',
    horseId: 'nova',
    recordType: 'checkup',
    offset: -30,
    title: 'Pre-season examination',
    veterinarian: SARA,
    notes: 'Fit to work. Slight stiffness on the right rein; keep an eye on it.',
  },
  {
    id: 'mr-043',
    horseId: 'saffron',
    recordType: 'vaccination',
    offset: -20,
    title: 'Strangles vaccination',
    veterinarian: SARA,
    vaccine: { name: 'Strangles', nextDueOffset: 345 },
  },
  {
    id: 'mr-044',
    horseId: 'saffron',
    recordType: 'treatment',
    offset: -50,
    title: 'Routine dental float',
    veterinarian: LAYLA,
    treatment: 'Cheek teeth rasped; wolf tooth on the right left in place.',
  },
  {
    id: 'mr-045',
    horseId: 'jasmine',
    recordType: 'vaccination',
    offset: -100,
    title: 'Equine herpesvirus booster',
    veterinarian: SARA,
    vaccine: { name: 'Equine herpesvirus (EHV-1/4)', nextDueOffset: 80 },
  },
  {
    id: 'mr-046',
    horseId: 'jasmine',
    recordType: 'checkup',
    offset: 12,
    title: 'Pre-race examination',
    status: 'scheduled',
    veterinarian: SARA,
  },
];

function horseNames(): Map<string, string> {
  return new Map(buildHorseMocks().map((horse) => [horse.id, horse.name]));
}

export function buildMedicalMocks(now: Date = new Date()): MedicalRecord[] {
  const names = horseNames();

  return seeds.map((seed) => {
    const horseName = names.get(seed.horseId);
    // A seed naming a horse Horse Management does not have is a bug in this
    // file, not a runtime condition, so it fails loudly while developing.
    if (!horseName) throw new Error(`Medical mock references unknown horse "${seed.horseId}".`);

    const status = seed.status ?? 'completed';
    const date = at(now, seed.offset, seed.hour, seed.minute);
    // A booking is entered days before it happens; anything else a few hours after.
    const createdAt =
      status === 'scheduled'
        ? at(now, -3, 15, 10)
        : new Date(Math.min(new Date(date).getTime() + 3 * HOUR_MS, now.getTime())).toISOString();

    return {
      id: seed.id,
      horseId: seed.horseId,
      horseName,
      recordType: seed.recordType,
      date,
      title: seed.title,
      diagnosis: seed.diagnosis ?? null,
      treatment: seed.treatment ?? null,
      medication: seed.medication ?? null,
      veterinarian: seed.veterinarian ?? null,
      status,
      notes: seed.notes ?? null,
      attachments: seed.attachments?.(now) ?? [],
      followUpDate: seed.followUpOffset === undefined ? null : at(now, seed.followUpOffset),
      followUpNotes: seed.followUpNotes ?? null,
      vaccine: seed.vaccine
        ? {
            name: seed.vaccine.name,
            nextDueDate:
              seed.vaccine.nextDueOffset === null ? null : at(now, seed.vaccine.nextDueOffset),
          }
        : null,
      createdAt,
    };
  });
}

/**
 * Health statuses are set by a person and stored, never calculated. Horses that
 * appear in no entry have simply never been assessed, which the UI says plainly
 * instead of defaulting them to "Healthy".
 */
const healthSeeds: { horseId: string; status: HealthStatus; note: string | null; ago: number }[] = [
  { horseId: 'luna', status: 'healthy', note: null, ago: 12 },
  {
    horseId: 'storm',
    status: 'recovering',
    note: 'Walking only until the recheck on the leg.',
    ago: 6,
  },
  {
    horseId: 'thunder',
    status: 'monitoring',
    note: 'Dental and eye examination booked for tomorrow.',
    ago: 3,
  },
  {
    horseId: 'duke',
    status: 'under-treatment',
    note: 'On a daily anti-inflammatory; review due soon.',
    ago: 9,
  },
  { horseId: 'shadow', status: 'healthy', note: null, ago: 14 },
  {
    horseId: 'willow',
    status: 'needs-attention',
    note: 'Suspected laminitis. Box rest until the recheck.',
    ago: 2,
  },
  {
    horseId: 'bella',
    status: 'under-treatment',
    note: 'Managing airway obstruction; endoscopy recheck planned.',
    ago: 14,
  },
  { horseId: 'sultan', status: 'monitoring', note: null, ago: 30 },
  { horseId: 'amira', status: 'recovering', note: 'Wound healing well after surgery.', ago: 5 },
  { horseId: 'comet', status: 'monitoring', note: 'Left eye quiet. Six-monthly checks.', ago: 20 },
  { horseId: 'zahra', status: 'healthy', note: 'Second tetanus dose is overdue.', ago: 10 },
  { horseId: 'nova', status: 'healthy', note: null, ago: 30 },
  { horseId: 'saffron', status: 'healthy', note: null, ago: 20 },
  { horseId: 'jasmine', status: 'healthy', note: null, ago: 25 },
];

export function buildHealthMocks(now: Date = new Date()): HorseHealth[] {
  const names = horseNames();
  return healthSeeds.map((seed) => {
    const horseName = names.get(seed.horseId);
    if (!horseName) throw new Error(`Health mock references unknown horse "${seed.horseId}".`);
    return {
      horseId: seed.horseId,
      horseName,
      status: seed.status,
      note: seed.note,
      updatedAt: at(now, -seed.ago, 16, 0),
    };
  });
}
