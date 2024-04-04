import type { Middleware } from '../types.ts';

/**
 * Returns a middleware that will set default headers to request.
 * @param defaults Default headers.
 * @return Middleware.
 */
export function defaultHeaders(defaults: HeadersInit): Middleware {
  return (request, next) => {
    // IMPORTANT: for avoid mutate request, just create new Headers and Request here
    const headers = new Headers(defaults);

    if (request.headers) {
      new Headers(request.headers).forEach((value, key) => {
        headers.append(key, value);
      });
    }

    return next(new Request(request, { headers }));
  };
}
