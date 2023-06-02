import { Handler, Enhancer, Middleware } from './types';

/**
 * Enhance fetch function by provided enhancer.
 * @param fetchFn Fetch function.
 * @param enhance Enhancer.
 * @return Enhanced fetch function.
 * @todo Need to get isomorphic fetch interface.
 * @todo Result type should be typeof fetch extended by enhancer (need update enhance mechanism).
 */
export function configureFetch<T extends typeof fetch>(
  fetchFn: T,
  enhance?: Enhancer,
): typeof fetch {
  let inner: Handler = request => fetchFn(request);

  if (enhance) {
    inner = enhance(inner);
  }

  return (input, init) => Promise.resolve(inner(new Request(input, init)));
}

/**
 * Creates enhancer that applies middleware to fetch.
 * @param list Middleware list.
 * @returns Enhancer.
 */
export function applyMiddleware(...list: Array<Middleware>): Enhancer {
  return function enhance(requestFn) {
    let result = requestFn;

    for (const item of list.reverse()) {
      const next = result;
      result = request => Promise.resolve(item(request, next));
    }

    return result;
  };
}
