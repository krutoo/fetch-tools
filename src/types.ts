/** Function that perform HTTP request (wrapper for fetch). */
export interface RequestFunction {
  (request: Request): Promise<Response>;
}

/** Request function enhancer. */
export interface Enhancer {
  (fetchFn: typeof fetch): typeof fetch;
}

/** HTTP Request process middleware as function. */
export type Middleware = MiddlewareFunction | MiddlewareObject;

export interface MiddlewareFunction {
  (request: Request, next: RequestFunction): Response | Promise<Response>;
}

/** HTTP Request process middleware as object. */
export interface MiddlewareObject {
  payload: (input: Parameters<typeof fetch>[0], init: Parameters<typeof fetch>[1]) => Request;
  fetch: MiddlewareFunction;
}

/** Simple cookie store. */
export interface CookieStore {
  getCookies(): string;
  setCookie(cookie: string): void;
}
