import type { Handler } from './types';

interface Route {
  is(url: URL): boolean;
  handler: Handler;
}

export function router(...routes: Route[]): Handler {
  return request => {
    const url = new URL(request.url);

    for (const route of routes) {
      if (route.is(url)) {
        return route.handler(request);
      }
    }

    return new Response('Not found', { status: 404 });
  };
}

export function route(pattern: string | ((url: URL) => boolean), handler: Handler): Route {
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
