import { notFound } from './response';

export type Handler = (request: Request) => Response | Promise<Response>;

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

    return notFound();
  };
}

export function route(pathname: string, handler: Handler): Route {
  return {
    is: url => url.pathname === pathname,
    handler,
  };
}
