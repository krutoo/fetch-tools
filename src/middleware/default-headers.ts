import type { Middleware } from '#fetch';

/** Options of default headers middleware. */
export interface DefaultHeadersOptions {
  /**
   * How to add headers to request headers.
   * - "set" - `defaults` will be added to `request.headers` using "set" method
   * - "append" - `defaults` will be added to `request.headers` using "append" method
   * - "defaults-set" - `request.headers` will be added to `defaults` using "set" method
   * - "defaults-append" - `request.headers` will be added to `defaults` using "append" method
   */
  strategy?: 'set' | 'append' | 'defaults-set' | 'defaults-append';

  /** Determines whether or not to use default headers. */
  when?: (request: Request) => boolean;
}

function getTrue() {
  return true;
}

/**
 * Returns a middleware that will set default headers to request.
 * @param defaults Default headers.
 * @return Middleware.
 */
export function defaultHeaders(
  defaults: HeadersInit,
  {
    strategy = 'set',
    when: matches = getTrue,
  }: DefaultHeadersOptions = {},
): Middleware {
  return (request, next) => {
    if (!matches(request)) {
      return next(request);
    }

    /**
     * Previously, there was a different approach here:
     * headers were created based on "defaults" argument,
     * then headers from the request were added to them.
     *
     * This was done so that the "default headers" were
     * truly default and were overridden by what was set by
     * the developer in the request itself.
     *
     * But it didn't work well because browser always
     * had the "Content-Type" header set by default,
     * which always overridden the option that was in the
     * middleware factory arguments.
     *
     * To fix this, `strategy` option is introduced.
     */

    // IMPORTANT: for avoid mutate request, just create new Headers and Request here
    const headers = new Headers(strategy.startsWith('defaults-') ? defaults : request.headers);

    if (strategy === 'defaults-set') {
      request.headers.forEach((value, key) => {
        headers.set(key, value);
      });
    }

    if (strategy === 'defaults-append') {
      request.headers.forEach((value, key) => {
        headers.append(key, value);
      });
    }

    if (strategy === 'set') {
      new Headers(defaults).forEach((value, key) => {
        headers.set(key, value);
      });
    }

    if (strategy === 'append') {
      new Headers(defaults).forEach((value, key) => {
        headers.append(key, value);
      });
    }

    return next(new Request(request, { headers }));
  };
}
