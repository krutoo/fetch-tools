import type { Middleware } from '../types.ts';

/** Options of JWT middleware. */
export interface JwtMiddlewareOptions {
  /** JWT Token. */
  token: string | (() => string | Promise<string>);

  /** Filter. Takes request, should return boolean. When returns false, JWT payload will not be added to request. */
  filter?: (request: Request) => boolean;
}

/**
 * Simple JWT middleware. Will add "Authorization" header  with JWT token to request.
 * @param options Options.
 * @returns Middleware.
 */
export function jwt({
  token,
  filter = () => true,
}: JwtMiddlewareOptions): Middleware {
  const getToken = typeof token === 'function' ? token : () => token;

  return async (request, next) => {
    if (!filter(request)) {
      return next(request);
    }

    // IMPORTANT: for avoid mutate request, just create new Headers and Request here
    const headers = new Headers(request.headers);

    headers.set('Authorization', `Bearer ${await getToken()}`);

    return next(new Request(request, { headers }));
  };
}