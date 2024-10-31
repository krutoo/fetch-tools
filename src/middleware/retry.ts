import type { Middleware } from '#fetch';
import { dump } from '#response';

/** Retry middleware config. */
export interface RetryOptions {
  /** Retries count. */
  count?: number;

  /** Should try again if received response is not OK. */
  whenNotOk?: boolean;

  /** Should try again if an exception is thrown. */
  whenCatch?: boolean;
}

/**
 * Returns a middleware that will retry the request until either:
 * - or the retries count is exceeded;
 * - or until a successful response is received.
 * @param init Repeat count or options.
 * @returns Middleware.
 * @todo Consider AbortSignal.
 */
export function retry(
  init: number | RetryOptions,
): Middleware {
  const { count = 1, whenNotOk = true, whenCatch = true } = typeof init === 'number'
    ? { count: init }
    : init;

  return async (request, next) => {
    let index = 0;

    while (true) {
      index++;

      try {
        const response = await next(request.clone());

        if (!response.ok && whenNotOk && index < count) {
          await dump(response);
          continue;
        }

        return response;
      } catch (error) {
        if (whenCatch && index < count) {
          continue;
        }

        throw error;
      }
    }
  };
}
