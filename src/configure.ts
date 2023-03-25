import { Enhancer, Middleware, RequestConfig } from './types';

// @todo need to get isomorphic fetch interface
// @todo return type should be typeof fetch extended by enhancer (need update enhance mechanism)
export function configureFetch<T extends typeof fetch>(
  fetchFn: T,
  enhance?: Enhancer,
): typeof fetch {
  let inner = (config: RequestConfig): Promise<Response> => {
    const { url, ...init } = config;
    return fetchFn(url, init);
  };

  if (enhance) {
    inner = enhance(inner);
  }

  const outer = (input: Parameters<T>[0], init?: Parameters<T>[1]) => inner(toConfig(input, init));

  return outer;
}

export function applyMiddleware(...list: Middleware[]): Enhancer {
  return function enhance(fetch) {
    let result = fetch;

    for (const item of list.reverse()) {
      const inner = result;
      result = config => item(config, newConfig => inner(newConfig));
    }

    return result;
  };
}

function toConfig<T extends typeof fetch>(
  input: Parameters<T>[0],
  init?: Parameters<T>[1],
): RequestConfig {
  if (typeof input === 'string' || input instanceof URL) {
    return {
      url: String(input),
      ...init,
    };
  } else if (input instanceof Request) {
    return {
      url: input.url,
      ...init,
    };
  } else {
    return { url: '', ...init };
  }
}
