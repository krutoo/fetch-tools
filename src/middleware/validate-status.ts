import type { Middleware } from '#fetch';
import { dump } from '#response';

/** Options for defaultHeaders middleware. */
export interface ValidateStatusOptions {
  /** Should return value that will be thrown. */
  getThrowable?: (response: Response) => unknown;

  /** When true, response.body will be dumped before throwing. */
  needDump?: boolean;
}

/**
 * Returns a middleware that will validate status.
 * @param validate Validate function.
 * @return Middleware.
 */
export function validateStatus(
  validate: (status: number, request: Request, response: Response) => boolean,
  {
    getThrowable = (response) => new Error(`Request failed with status ${response.status}`),
    needDump = true,
  }: ValidateStatusOptions = {},
): Middleware {
  return async (request, next) => {
    const response = await next(request);

    if (!validate(response.status, request, response)) {
      if (needDump) {
        await dump(response);
      }
      throw getThrowable(response);
    }

    return response;
  };
}
