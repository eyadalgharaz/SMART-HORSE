import { mockTeamService } from './mock/mock-team-service';
import type { TeamService } from './types';

/**
 * Single seam between the Team Members UI and its data.
 *
 * Phase G: mock implementation in the browser.
 * Later:   `export const teamService: TeamService = httpTeamService;`
 *          backed by `/api/v1/team`.
 *
 * Components must never import the mock directly.
 */
export const teamService: TeamService = mockTeamService;
