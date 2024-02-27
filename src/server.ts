import type { Handler } from './types';

interface Route {
  is(url: URL, request: Request): boolean;
  handler: Handler;
}

export function router(...routes: Route[]): Handler {
  return request => {
    const url = new URL(request.url);

    for (const route of routes) {
      if (route.is(url, request)) {
        return route.handler(request);
      }
    }

    return new Response('Not found', { status: 404 });
  };
}

export function route(
  pattern: string | ((url: URL, request: Request) => boolean),
  handler: Handler,
): Route {
  if (typeof pattern === 'function') {
    return {
      is: pattern,
      handler,
    };
  }

  return {
    is: url => url.pathname === pattern,
    handler,
  };
}

route.get = (
  pattern: string | ((url: URL, request: Request) => boolean),
  handler: Handler,
): Route => {
  if (typeof pattern === 'function') {
    return {
      is: pattern,
      handler,
    };
  }

  return {
    is: (url, request) => request.method.toLowerCase() === 'get' && url.pathname === pattern,
    handler,
  };
};
