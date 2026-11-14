import type { ConfigureFetch, ConfigureFetchOptions, Handler } from './types.ts';

/**
 * Returns `configureFetch` configured with defined defaults.
 * By default `configureFetch` uses global Request class.
 * By `createConfigureFetch` you can define custom `configureFetch`
 * with custom implementation of `Request`.
 * @param options Options.
 * @return Function to configure `fetch`.
 */
export function createConfigureFetch(options: ConfigureFetchOptions = {}): ConfigureFetch {
  const Request = options.Request ?? globalThis.Request;

  return (fetchFn, enhance) => {
    let inner: Handler = (request) => fetchFn(request);

    if (enhance) {
      inner = enhance(inner);
    }

    return async (input, init) => {
      return await inner(new Request(input, init));
    };
  };
}

/**
 * Enhance fetch function by provided enhancer.
 * @param fetchFn Fetch function.
 * @param enhance Enhancer.
 * @return Enhanced fetch function.
 * @todo Need to get isomorphic fetch interface.
 * @todo Result type should be typeof fetch extended by enhancer? (need update enhance mechanism).
 */
export const configureFetch: ConfigureFetch = createConfigureFetch();
