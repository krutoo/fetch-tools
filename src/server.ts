import type { Middleware } from './types';
import { applyMiddleware } from './configure';
import { notFound } from './response';

export type Handler = (request: Request) => Response | Promise<Response>;

export function router(...middleware: Middleware[]) {
  const enhancer = applyMiddleware(...middleware)(() => Promise.resolve(notFound()));

  return (request: Request) => enhancer(request);
}

export function route(pathname: string, handler: Handler): Middleware {
  return async (request, next) => {
    if (new URL(request.url).pathname === pathname) {
      // @todo непонятно как правильно делать
      await next(request);
      return handler(request);
    }

    return next(request);
  };
}
