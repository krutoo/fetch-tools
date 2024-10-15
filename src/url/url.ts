import type { URLSearchParamsInit } from './types.ts';

/**
 * Получив параметры применит их к переданному URL.
 * @param url URL.
 * @param params Параметры.
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

export function resetParams(url: URL): URL {
  url.search = '';
  return url;
}

/**
 * Получив URL и параметры вернет новый URL с примененными параметрами.
 * @param url URL.
 * @param params Параметры.
 * @return URL.
 */
export function withParams(url: string | URL, params: URLSearchParamsInit): URL {
  return setParams(new URL(url), params);
}

/**
 * Получив URL вернет его копию но без параметров.
 * @param url URL.
 * @return URL.
 */
export function withoutParams(url: string | URL): URL {
  return resetParams(new URL(url));
}

export const URLUtil = {
  setParams,
  resetParams,
  withParams,
  withoutParams,
};

export default URLUtil;
