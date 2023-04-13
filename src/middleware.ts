import type { Middleware, CookieStore } from './types';

/** Basic data for log handler. */
export interface LogData {
  request: Request;
}

/** Successful response data. */
export interface DoneLogData extends LogData {
  response: Response;
}

/** Request failure data. */
export interface FailLogData extends LogData {
  error: unknown;
}

/** Log handler. */
export interface LogHandler {
  beforeRequest?(data: LogData): Promise<void> | void;
  afterResponse?(data: DoneLogData): Promise<void> | void;
  onCatch?(data: FailLogData): Promise<void> | void;
}

/** Log handler factory. */
export interface LogHandlerFactory {
  (data: LogData): LogHandler;
}

/**
 * Returns a middleware that will concatenate url with "base" url part from parameter.
 * @param url Base URL.
 * @return Middleware.
 */
export function baseURL(base: string | URL): Middleware {
  return {
    payload(input, init) {
      if (typeof input === 'string') {
        const readyURL = new URL(input, base);
        return new Request(readyURL, init);
      }

      if (input instanceof URL) {
        const readyURL = new URL(input, base);
        return new Request(readyURL, init);
      }

      if (input instanceof Request) {
        const readyURL = new URL(input.url, base);
        return new Request(new Request(readyURL, input), init);
      }

      return new Request(input, init);
    },

    fetch(request, next) {
      return next(request);
    },
  };
}

/**
 * Returns a middleware that will set default headers to request.
 * @param defaults Default headers.
 * @return Middleware.
 */
export function defaultHeaders(defaults: HeadersInit): Middleware {
  return (request, next) => {
    const headers = new Headers(defaults);

    if (request.headers) {
      new Headers(request.headers).forEach((value, key) => {
        headers.append(key, value);
      });
    }

    return next(new Request(request, { headers }));
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
  return async (request, next) => {
    const data: LogData = { request };
    const handler = typeof handlerInit === 'function' ? handlerInit(data) : handlerInit;

    try {
      await handler.beforeRequest?.(data);

      const response = await next(request);

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
  return async (request, next) => {
    const headers = new Headers(request.headers);

    headers.append('cookie', store.getCookies());

    const response = await next(new Request(request, { headers }));

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
