import type { Middleware } from '../types';

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
