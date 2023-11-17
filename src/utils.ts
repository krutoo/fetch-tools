import type { CookieStore } from './types';

/**
 * Returns new cookie store.
 * @param initialCookies Initial cookies string.
 * @returns Cookie store.
 * @todo Look for https://developer.mozilla.org/en-US/docs/Web/API/CookieStore.
 */
export function createCookieStore(initialCookies?: string): CookieStore {
  const items: Map<string, string> = new Map();
  const listeners = new Set<VoidFunction>();

  const setCookie = (cookie: string) => {
    // IMPORTANT: separating cookie from its attributes
    const [cookiePart] = cookie.split('; ');

    if (!cookiePart) {
      // @todo log?
      return;
    }

    const [cookieName, cookieValue] = cookiePart.split('=');

    if (!cookieName || typeof cookieValue !== 'string') {
      // @todo log?
      return;
    }

    items.set(cookieName, cookieValue);

    listeners.forEach(fn => fn());
  };

  const getCookies = () => {
    const list: string[] = [];

    items.forEach((cookieValue, cookieName) => {
      list.push(`${cookieName}=${cookieValue}`);
    });

    return list.join('; ');
  };

  const subscribe = (listener: VoidFunction): VoidFunction => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  if (initialCookies && initialCookies.length > 0) {
    initialCookies.split('; ').forEach(setCookie);
  }

  return { setCookie, getCookies, subscribe };
}
