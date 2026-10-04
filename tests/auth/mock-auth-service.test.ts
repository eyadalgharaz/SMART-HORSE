import { afterEach, describe, expect, it } from 'vitest';
import { mockAuthService } from '@/features/auth/mock/mock-auth-service';

describe('mockAuthService', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('registers an account with the chosen role and starts a session with it', async () => {
    const session = await mockAuthService.register({
      fullName: 'Nour Ibrahim',
      email: 'nour@stable.test',
      password: 'password1',
      farmRole: 'Doctor',
    });

    expect(session.user.farmRole).toBe('Doctor');
    expect(session.user.fullName).toBe('Nour Ibrahim');
  });

  it('rejects registering an email that already has an account', async () => {
    await mockAuthService.register({
      fullName: 'Nour Ibrahim',
      email: 'nour@stable.test',
      password: 'password1',
      farmRole: 'Doctor',
    });

    await expect(
      mockAuthService.register({
        fullName: 'Someone Else',
        email: 'nour@stable.test',
        password: 'password1',
        farmRole: 'Worker',
      }),
    ).rejects.toThrow(/already uses this email/i);
  });

  it('preserves a registered account\u2019s role across a later, separate login', async () => {
    await mockAuthService.register({
      fullName: 'Nour Ibrahim',
      email: 'nour@stable.test',
      password: 'password1',
      farmRole: 'Doctor',
    });
    await mockAuthService.logout();

    const session = await mockAuthService.login({
      email: 'nour@stable.test',
      password: 'a-different-password1',
    });

    expect(session.user.farmRole).toBe('Doctor');
    expect(session.user.fullName).toBe('Nour Ibrahim');
  });

  it('signs an unregistered email in as a Farm Owner demo account, unchanged from before', async () => {
    const session = await mockAuthService.login({
      email: 'anyone@stable.test',
      password: 'password1',
    });

    expect(session.user.farmRole).toBe('FarmOwner');
  });
});
