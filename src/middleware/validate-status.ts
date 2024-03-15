import type { Middleware } from '../types';

/** Options for defaultHeaders middleware. */
export interface ValidateStatusOptions {
  getThrowable?: (response: Response) => any;
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
  }: ValidateStatusOptions = {},
): Middleware {
  return async (request, next) => {
    const response = await next(request);

    if (!validate(response.status, request, response)) {
      throw getThrowable(response);
    }

    return response;
  };
}
