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
    const headers = new Headers(request.headers);

    /*
      Previously, there was a different approach here: headers were created based on "defaults" argument, then headers from the request were added to them.

      This was done so that the "default headers" were truly default and were overridden by what was set by the developer in the request itself.

      But it didn't work well because browser always had the "Content-Type" header set by default, which always overridden the option that was in the middleware factory arguments.

      To fix this, default headers are now added to the request headers
    */
    new Headers(defaults).forEach((value, key) => {
      headers[strategy](key, value);
    });

    return next(new Request(request, { headers }));
  };
}
