import type { Middleware } from '#fetch';

/** Options of JWT middleware. */
export interface JwtMiddlewareOptions {
  /** JWT Token. */
  token: string | (() => string | null | Promise<string | null>);

  /** Filter. Takes request, should return boolean. When returns false, JWT payload will not be added to request. */
  filter?: (request: Request) => boolean;

  /** Allows to change default format "Bearer {accessToken}" of "Authorization" header value. */
  format?: (token: string) => string;
}

/**
 * Simple JWT middleware. Will add "Authorization" header  with JWT token to request.
 * @param options Options.
 * @returns Middleware.
 */
export function jwt({
  token,
  filter = () => true,
  format = (tokenValue) => `Bearer ${tokenValue}`,
}: JwtMiddlewareOptions): Middleware {
  const getToken = typeof token === 'function' ? token : () => token;

  return async (request, next) => {
    if (!filter(request)) {
      return next(request);
    }

    // IMPORTANT: for avoid mutate request, just create new Headers and Request here
    const headers = new Headers(request.headers);

    const token = await getToken();

    if (typeof token === 'string') {
      headers.set('Authorization', format(token));
    }

    return next(new Request(request, { headers }));
  };
}
