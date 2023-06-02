import type { CookieStore } from './types';

export class StatusError extends Error {
  static is(value: unknown): value is StatusError {
    return value instanceof StatusError;
  }

  constructor(message: string) {
    super(message);
    this.name = 'StatusError';
  }
}

/**
 * Returns new cookie store.
 * @param initialCookies Initial cookies string.
 * @returns Cookie store.
 */
export function createCookieStore(initialCookies?: string): CookieStore {
  const items: Map<string, string> = new Map();

  const setCookie = (cookie: string) => {
    // IMPORTANT: separating cookie from its attributes
    const [cookiePart] = cookie.split('; ');

    if (!cookiePart) {
      // @todo log instead throwing error
      throw Error('Failed to parse cookie');
    }

    const [cookieName, cookieValue] = cookiePart.split('=');

    if (!cookieName || !cookieValue) {
      // @todo log instead throwing error
      throw Error('Failed to parse cookie');
    }

    items.set(cookieName, cookieValue);
  };

  const getCookies = () => {
    const list: string[] = [];

    items.forEach((cookieValue, cookieName) => {
      list.push(`${cookieName}=${cookieValue}`);
    });

    return list.join('; ');
  };

  if (initialCookies && initialCookies.length > 0) {
    initialCookies.split('; ').forEach(setCookie);
  }

  return { setCookie, getCookies };
}
