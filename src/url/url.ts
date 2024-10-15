import type { URLSearchParamsInit } from './types.ts';

/**
 * Having received the parameters will apply them to the transferred URL.
 * @param url URL.
 * @param params Parameters init - object with any property values.
 * @return Exactly same URL object.
 */
export function setParams(url: URL, params: URLSearchParamsInit): URL {
  for (const [paramName, paramValue] of Object.entries(params)) {
    if (paramValue === null) {
      url.searchParams.delete(paramName);
      continue;
    }

    if (paramValue !== undefined) {
      url.searchParams.set(paramName, String(paramValue));
      continue;
    }
  }

  return url;
}

/**
 * Having received the URL will delete all the parameters and return it.
 * @param url URL.
 * @return Exactly same URL object.
 */
export function resetParams(url: URL): URL {
  url.search = '';

  return url;
}

/**
 * Having received the URL and the parameters will return the new URL using the parameters.
 * @param url URL.
 * @param params Parameters.
 * @return New URL.
 */
export function withParams(url: string | URL, params: URLSearchParamsInit): URL {
  return setParams(new URL(url), params);
}

/**
 * Having received the URL will return its copy but without parameters.
 * @param url URL.
 * @return New URL.
 */
export function withoutParams(url: string | URL): URL {
  return resetParams(new URL(url));
}

/** Utils for working with URL. */
export const URLUtil = {
  setParams,
  resetParams,
  withParams,
  withoutParams,
};

export default URLUtil;
