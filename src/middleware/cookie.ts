import type { CookieStore, Middleware } from '../types';

/**
 * Returns a middleware that will accumulate cookies.
 * Useful on the server.
 * @param store Cookie store.
 * @return Middleware.
 */
export function cookie(store: CookieStore): Middleware {
  return async (request, next) => {
    // IMPORTANT: for avoid mutate request, just create new Headers and Request here
    const headers = new Headers(request.headers);

    headers.append('cookie', store.getCookies());

    const response = await next(new Request(request, { headers }));

    if (response.headers.has('set-cookie')) {
      if (response.headers.getSetCookie as unknown) {
        response.headers.getSetCookie().forEach(value => {
          store.setCookie(value);
        });
      } else {
        response.headers.forEach((headerValue, headerName) => {
          if (headerName === 'set-cookie') {
            store.setCookie(headerValue);
          }
        });
      }
    }

    return response;
  };
}
