import type { Handler } from '#fetch';

interface Route {
  matches(url: URL, request: Request): boolean;
  handler: Handler;
}

type RoutePattern = string | ((url: URL, request: Request) => boolean);

interface RouteFactory {
  (pattern: RoutePattern, handler: Handler): Route;
}

interface RouterAPI {
  (...routes: Route[]): Handler;
  builder: () => HandlerBuilder;
}

interface RouteAPI extends RouteFactory {
  all: RouteFactory;
  get: RouteFactory;
  post: RouteFactory;
  put: RouteFactory;
  delete: RouteFactory;
  head: RouteFactory;
  options: RouteFactory;
  connect: RouteFactory;
  patch: RouteFactory;
}

export const router: RouterAPI = (...routes: Route[]): Handler => {
  return (request) => {
    const url = new URL(request.url);

    for (const route of routes) {
      if (route.matches(url, request)) {
        return route.handler(request);
      }
    }

    return new Response('Not found', { status: 404 });
  };
};

router.builder = builder;

export const route: RouteAPI = (pattern: RoutePattern, handler: Handler): Route => {
  if (typeof pattern === 'function') {
    return {
      matches: pattern,
      handler,
    };
  }

  return {
    matches: (url) => url.pathname === pattern,
    handler,
  };
};

route.all = (...args) => route(...args); // for express compatibility
route.get = createRouteFactoryForMethod('get');
route.post = createRouteFactoryForMethod('post');
route.put = createRouteFactoryForMethod('put');
route.delete = createRouteFactoryForMethod('delete');
route.head = createRouteFactoryForMethod('head');
route.options = createRouteFactoryForMethod('options');
route.connect = createRouteFactoryForMethod('connect');
route.patch = createRouteFactoryForMethod('patch');

function createRouteFactoryForMethod(method: string): RouteFactory {
  const isSuitableMethod = (request: Request) => request.method.toLowerCase() === method;

  return (pattern: RoutePattern, handler: Handler): Route => {
    if (typeof pattern === 'function') {
      return {
        matches: (url, req) => isSuitableMethod(req) && pattern(url, req),
        handler,
      };
    }

    return {
      matches: (url, request) => isSuitableMethod(request) && url.pathname === pattern,
      handler,
    };
  };
}

interface HandlerBuilder {
  all(pattern: RoutePattern, handler: Handler): this;
  get(pattern: RoutePattern, handler: Handler): this;
  post(pattern: RoutePattern, handler: Handler): this;
  put(pattern: RoutePattern, handler: Handler): this;
  delete(pattern: RoutePattern, handler: Handler): this;
  head(pattern: RoutePattern, handler: Handler): this;
  options(pattern: RoutePattern, handler: Handler): this;
  connect(pattern: RoutePattern, handler: Handler): this;
  patch(pattern: RoutePattern, handler: Handler): this;
  build(): Handler;
}

function builder(): HandlerBuilder {
  const routeList: Array<Route> = [];

  const builder: HandlerBuilder = {
    all(pattern, handler) {
      routeList.push(route.all(pattern, handler));

      return builder;
    },

    get(pattern, handler) {
      routeList.push(route.get(pattern, handler));

      return builder;
    },

    post(pattern, handler) {
      routeList.push(route.post(pattern, handler));

      return builder;
    },

    put(pattern, handler) {
      routeList.push(route.put(pattern, handler));

      return builder;
    },

    delete(pattern, handler) {
      routeList.push(route.delete(pattern, handler));

      return builder;
    },

    head(pattern, handler) {
      routeList.push(route.head(pattern, handler));

      return builder;
    },

    options(pattern, handler) {
      routeList.push(route.options(pattern, handler));

      return builder;
    },

    connect(pattern, handler) {
      routeList.push(route.connect(pattern, handler));

      return builder;
    },

    patch(pattern, handler) {
      routeList.push(route.patch(pattern, handler));

      return builder;
    },

    build() {
      return router(...routeList);
    },
  };

  return builder;
}
