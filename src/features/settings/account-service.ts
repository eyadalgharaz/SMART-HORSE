import { mockAccountService } from './mock/mock-account-service';
import type { AccountService } from './types';

/**
 * Single seam between the Account Settings UI and its data.
 *
 * Phase G: mock implementation in the browser.
 * Later:   `export const accountService: AccountService = httpAccountService;`
 *          backed by `/api/v1/account`.
 *
 * Components must never import the mock directly.
 */
export const accountService: AccountService = mockAccountService;
