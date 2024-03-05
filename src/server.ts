import type { Handler } from './types';

interface Route {
  is(url: URL, request: Request): boolean;
  handler: Handler;
}

type RoutePattern = string | ((url: URL, request: Request) => boolean);

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

export function route(pattern: RoutePattern, handler: Handler): Route {
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

route.get = createRouteFactoryForMethod('get');
route.post = createRouteFactoryForMethod('post');
route.put = createRouteFactoryForMethod('put');
route.delete = createRouteFactoryForMethod('delete');
route.head = createRouteFactoryForMethod('head');
route.options = createRouteFactoryForMethod('options');
route.connect = createRouteFactoryForMethod('connect');

function createRouteFactoryForMethod(method: string) {
  const isSuitableMethod = (request: Request) => request.method.toLowerCase() === method;

  return (pattern: RoutePattern, handler: Handler): Route => {
    if (typeof pattern === 'function') {
      return {
        is: (url, req) => isSuitableMethod(req) && pattern(url, req),
        handler,
      };
    }

    return {
      is: (url, request) => isSuitableMethod(request) && url.pathname === pattern,
      handler,
    };
  };
}
