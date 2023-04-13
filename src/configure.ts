import { Enhancer, Middleware } from './types';

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
  let inner = (input: Parameters<T>[0], init?: Parameters<T>[1]) => fetchFn(input, init);

  if (enhance) {
    inner = enhance(inner);
  }

  const outer = (input: Parameters<T>[0], init?: Parameters<T>[1]) => inner(input, init);

  return outer;
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
      const inner = result;

      if (typeof item === 'function') {
        result = (input, init) => Promise.resolve(item(new Request(input, init), inner));
      } else {
        result = (input, init) => Promise.resolve(item.fetch(item.payload(input, init), inner));
      }
    }

    return result;
  };
}
