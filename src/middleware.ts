import { RequestConfig, Middleware } from './types';

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

// @todo should also handle URL as "url" argument?
export function baseURL(url: string): Middleware {
  return async (config, next) =>
    next({
      ...config,
      url: `${url.replace(/\/$/, '')}/${String(config.url).replace(/\/$/, '')}`,
    });
}

export function validateStatus(validate: (status: number) => boolean): Middleware {
  return async (config, next) => {
    const response = await next(config);

    if (!validate(response.status)) {
      throw Error(`Request failed with status ${response.status}`);
    }

    return response;
  };
}

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
