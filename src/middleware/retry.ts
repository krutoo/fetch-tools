import type { Middleware } from '#fetch';

export function retry(count: number): Middleware {
  return async (request, next) => {
    let index = 0;

    while (true) {
      index++;
      try {
        return await next(request.clone());
      } catch (error) {
        if (index < count) {
          continue;
        } else {
          throw error;
        }
      }
    }
  };
}
