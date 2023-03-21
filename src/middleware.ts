import type { RequestConfig, Middleware, CookieStore } from './types';

export interface LogData {
  config: RequestConfig;
}

export interface DoneLogData extends LogData {
  response: Response;
}

export interface FailLogData extends LogData {
  error: unknown;
}

export interface LogHandler {
  beforeRequest?(data: LogData): Promise<void> | void;
  afterResponse?(data: DoneLogData): Promise<void> | void;
  onCatch?(data: FailLogData): Promise<void> | void;
}

export interface LogHandlerFactory {
  (data: LogData): LogHandler;
}

/**
 * Returns a middleware that will concatenate url with base url part from parameter.
 * @todo should also handle URL as "url" argument?
 * @param url Base URL.
 * @return Middleware.
 */
export function baseURL(url: string): Middleware {
  return (config, next) =>
    next({
      ...config,
      url: `${url.replace(/\/$/, '')}/${String(config.url).replace(/\/$/, '')}`,
    });
}

/**
 * Returns a middleware that will set default headers to request.
 * @param defaults Default headers.
 * @return Middleware.
 */
export function defaultHeaders(defaults: HeadersInit): Middleware {
  return (config, next) => {
    const headers = new Headers(defaults);

    if (config.headers) {
      new Headers(config.headers).forEach((value, key) => {
        headers.append(key, value);
      });
    }

    return next({ ...config, headers });
  };
}

/**
 * Returns a middleware that will validate status.
 * @param validate Validate function.
 * @return Middleware.
 */
export function validateStatus(validate: (status: number) => boolean): Middleware {
  return async (config, next) => {
    const response = await next(config);

    if (!validate(response.status)) {
      throw Error(`Request failed with status ${response.status}`);
    }

    return response;
  };
}

/**
 * Returns a middleware that will log phases by handler.
 * @param handlerInit Handler or handler factory.
 * @return Middleware.
 */
export function log(handlerInit: LogHandler | LogHandlerFactory): Middleware {
  return async (config, next) => {
    const data: LogData = { config };
    const handler = typeof handlerInit === 'function' ? handlerInit(data) : handlerInit;

    try {
      await handler.beforeRequest?.(data);

      const response = await next(config);

      await handler.afterResponse?.({ ...data, response });

      return response;
    } catch (error) {
      await handler.onCatch?.({ ...data, error });

      // IMPORTANT: do not mute error - throw it because we just log here
      throw error;
    }
  };
}

/**
 * Returns a middleware that will accumulate cookies.
 * Useful on the server.
 * @param store Cookie store.
 * @return Middleware.
 */
export function cookie(store: CookieStore): Middleware {
  return async (config, next) => {
    const headers = new Headers(config.headers);

    headers.append('cookie', store.getCookies());

    const response = await next({ ...config, headers });

    if (response.headers.has('set-cookie')) {
      response.headers.forEach((headerValue, headerName) => {
        if (headerName === 'set-cookie') {
          store.setCookie(headerValue);
        }
      });
    }

    return response;
  };
}
