/** Function that perform HTTP request (wrapper for fetch). */
export interface RequestFunction {
  (request: Request): Response | Promise<Response>;
}

/** Request function enhancer. */
export interface Enhancer {
  (request: RequestFunction): RequestFunction;
}

/** HTTP Request process middleware as function. */
export interface Middleware {
  (request: Request, next: RequestFunction): Response | Promise<Response>;
}

/** Simple cookie store. */
export interface CookieStore {
  getCookies(): string;
  setCookie(cookie: string): void;
}
