import type { Enhancer, Middleware } from './types.ts';

/**
 * Creates enhancer that applies middleware to fetch.
 * @param list Middleware list.
 * @returns Enhancer.
 */
export function applyMiddleware(...list: Array<Middleware>): Enhancer {
  if (list.length === 0) {
    return (handler) => handler;
  }

  return (handler) => {
    let result = handler;

    for (const item of list.reverse()) {
      const next = result;
      result = (request) => Promise.resolve(item(request, next));
    }

    return result;
  };
}
