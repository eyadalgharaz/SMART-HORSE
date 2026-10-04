import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/** Shared router stub — Next's navigation hooks need a client router in jsdom. */
export const routerMock = {
  replace: vi.fn(),
  push: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
};
export const navigationState = { pathname: '/dashboard', params: {} as Record<string, string> };

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  usePathname: () => navigationState.pathname,
  useSearchParams: () => new URLSearchParams(window.location.search),
  useParams: () => navigationState.params,
  redirect: vi.fn(),
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  navigationState.pathname = '/dashboard';
  navigationState.params = {};
  window.history.replaceState({}, '', '/');
  Object.values(routerMock).forEach((fn) => fn.mockClear());
});
