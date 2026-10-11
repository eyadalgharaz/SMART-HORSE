import { describe, expect, it } from 'vitest';
import { buildDashboardMock } from '@/features/dashboard/mock/dashboard-mock-data';
import { buildHorseMocks } from '@/features/horses/mock/horse-mock-data';
import { breedOptions } from '@/features/horses/vocabulary';
import { deriveUpcomingEvents, deriveVaccinations } from '@/features/medical/mock/derive';
import { buildHealthMocks, buildMedicalMocks } from '@/features/medical/mock/medical-mock-data';
import { buildNotificationMocks } from '@/features/notifications/mock/notification-mock-data';
import { buildFarmMock } from '@/features/settings/mock/farm-mock-data';
import { buildTeamMemberMocks } from '@/features/settings/mock/team-mock-data';
import { buildAssigneeMocks, buildTaskMocks } from '@/features/tasks/mock/task-mock-data';
import {
  buildProgramMocks,
  buildTrainerMocks,
  buildTrainingSessionMocks,
} from '@/features/training/mock/training-mock-data';
import { getContentTranslator } from '@/i18n/content';

/**
 * Every piece of demo text a screen can show must have an Arabic rendering,
 * so the Arabic interface never shows a stray English sentence from the seed
 * data. Adding a new seed record without its translation fails here.
 */

const tc = getContentTranslator('ar');
const NOW = new Date(2026, 8, 18, 10, 0);

function collect(): string[] {
  const texts: (string | null | undefined)[] = [];

  for (const horse of buildHorseMocks()) {
    texts.push(horse.name, horse.breed, horse.color, horse.owner?.name);
  }
  texts.push(...breedOptions);

  const records = buildMedicalMocks(NOW);
  for (const record of records) {
    texts.push(
      record.title,
      record.diagnosis,
      record.treatment,
      record.medication,
      record.veterinarian,
      record.notes,
      record.followUpNotes,
      record.vaccine?.name,
    );
  }
  for (const health of buildHealthMocks(NOW)) texts.push(health.note);
  const vaccinations = deriveVaccinations(records, NOW);
  for (const event of deriveUpcomingEvents(records, vaccinations, NOW)) texts.push(event.title);

  for (const session of buildTrainingSessionMocks(NOW)) {
    texts.push(
      session.title,
      session.result,
      session.trainerNotes,
      session.notes,
      session.trainerName,
    );
  }
  for (const program of buildProgramMocks(NOW)) {
    texts.push(
      program.name,
      program.description,
      program.goals,
      program.notes,
      program.trainerName,
    );
  }
  for (const trainer of buildTrainerMocks()) texts.push(trainer.name);

  for (const task of buildTaskMocks(NOW)) {
    texts.push(task.title, task.description, task.notes, task.assigneeName, task.horseName);
  }
  for (const assignee of buildAssigneeMocks()) texts.push(assignee.name, assignee.role);

  for (const notification of buildNotificationMocks(NOW)) {
    texts.push(notification.title, notification.message);
  }

  for (const member of buildTeamMemberMocks()) texts.push(member.fullName);
  const farm = buildFarmMock();
  texts.push(farm.name, farm.description, farm.address, farm.city, farm.country);

  const dashboard = buildDashboardMock(NOW);
  texts.push(dashboard.farm.name);

  return [...new Set(texts.filter((text): text is string => Boolean(text)))];
}

describe('Arabic demo-content coverage', () => {
  it('translates every user-facing string the mock services return', () => {
    const missing = collect().filter((text) => tc(text) === text);
    expect(missing).toEqual([]);
  });

  it('translates text the services compose at runtime', () => {
    expect(tc('Follow-up: Respiratory recheck')).toBe('متابعة: إعادة فحص الجهاز التنفسي');
    expect(tc('Morning feed round was marked complete.')).toBe(
      'تم إنجاز مهمة «جولة العلف الصباحية».',
    );
    expect(tc('Morning feed round was assigned to Tarek Nassar.')).toBe(
      'أُسندت مهمة «جولة العلف الصباحية» إلى طارق نصار.',
    );
  });

  it('leaves text without a translation — e.g. something a person typed — untouched', () => {
    expect(tc('My own note about Luna')).toBe('My own note about Luna');
    expect(tc('ملاحظة كتبتها بنفسي')).toBe('ملاحظة كتبتها بنفسي');
  });

  it('is a no-op in English', () => {
    expect(getContentTranslator('en')('Routine health examination')).toBe(
      'Routine health examination',
    );
  });
});
