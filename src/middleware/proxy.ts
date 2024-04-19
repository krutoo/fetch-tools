import type { Middleware } from '../types.ts';

export interface ProxyRequestFilter {
  (url: URL, request: Request): boolean;
}

export interface ProxyOptions {
  /** Defines which requests should be proxyed. */
  filter: string | string[] | ProxyRequestFilter;

  /** Defines the target host. */
  target: string;

  /** Defines how the incoming request path should change. */
  pathRewrite?: (pathname: string) => string;
}

/**
 * Simple proxy middleware for servers based on Web Fetch API.
 * Based on good article: https://blog.r0b.io/post/creating-a-proxy-with-deno/
 */
export function proxy({ filter, target, pathRewrite = p => p }: ProxyOptions): Middleware {
  const matches = createMatches(filter);

  const createRequest = (url: URL, request: Request) => {
    const targetURL = new URL(`.${pathRewrite(url.pathname)}`, target);
    targetURL.search = url.search;

    const headers = new Headers(request.headers);
    headers.set('Host', targetURL.hostname);

    return new Request(targetURL, {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'manual',
    });
  };

  return (request, next) => {
    const url = new URL(request.url);

    if (!matches(url, request)) {
      return next(request);
    }

    return fetch(createRequest(url, request));
  };
}

function createMatches(filter: ProxyOptions['filter']): ProxyRequestFilter {
  switch (true) {
    case Array.isArray(filter):
      return url => filter.some(item => url.pathname.startsWith(item));

    case typeof filter === 'string':
      return url => url.pathname.startsWith(filter);

    case typeof filter === 'function':
      return filter;

    default:
      return stubFalse;
  }
}

function stubFalse() {
  return false;
}
