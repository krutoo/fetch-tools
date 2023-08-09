import { Handler } from './types';

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

export function route(pathname: string, handler: Handler): Route {
  return {
    is: url => url.pathname === pathname,
    handler,
  };
}
