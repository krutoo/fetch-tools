import type { Middleware, CookieStore } from './types';

/** Options for defaultHeaders middleware. */
export interface DefaultHeadersOptions {
  getThrowable?: (response: Response) => any;
}

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
  onRequest?(data: LogData): Promise<void> | void;
  onResponse?(data: DoneLogData): Promise<void> | void;
  onCatch?(data: FailLogData): Promise<void> | void;
}

/** Log handler factory. */
export interface LogHandlerFactory {
  (data: LogData): LogHandler;
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
export function validateStatus(
  validate: (status: number, request: Request, response: Response) => boolean,
  {
    getThrowable = response => new Error(`Request failed with status ${response.status}`),
  }: DefaultHeadersOptions = {},
): Middleware {
  return async (request, next) => {
    const response = await next(request);

    if (!validate(response.status, request, response)) {
      throw getThrowable(response);
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
      await handler.onRequest?.(data);

      const response = await next(request);

      await handler.onResponse?.({ ...data, response });

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
      if (response.headers.getSetCookie as unknown) {
        response.headers.getSetCookie().forEach(value => {
          store.setCookie(value);
        });
      } else {
        response.headers.forEach((headerValue, headerName) => {
          if (headerName === 'set-cookie') {
            store.setCookie(headerValue);
          }
        });
      }
    }

    return response;
  };
}
