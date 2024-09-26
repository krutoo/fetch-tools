import type { Middleware } from '../types.ts';

/** Options of default headers middleware. */
export interface DefaultHeadersOptions {
  /**
   * How to add header to request headers.
   * - "set" - headers will be added using "set" method
   * - "append" - headers will be added using "append" method
   */
  strategy?: 'set' | 'append';
}

/**
 * Returns a middleware that will set default headers to request.
 * @param defaults Default headers.
 * @return Middleware.
 */
export function defaultHeaders(
  defaults: HeadersInit,
  { strategy = 'append' }: DefaultHeadersOptions = {},
): Middleware {
  return (request, next) => {
    // IMPORTANT: for avoid mutate request, just create new Headers and Request here
    const headers = new Headers(defaults);

    if (request.headers) {
      new Headers(request.headers).forEach((value, key) => {
        headers[strategy](key, value);
      });
    }

    return next(new Request(request, { headers }));
  };
}
