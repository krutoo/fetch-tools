/** Function that receives a request and must return a response. */
export interface Handler {
  (request: Request): Response | Promise<Response>;
}

/** Handler function enhancer. */
export interface Enhancer {
  (request: Handler): Handler;
}

/** Handle process middleware. */
export interface Middleware {
  (request: Request, next: Handler): Response | Promise<Response>;
}

/** Simple cookie store. */
export interface CookieStore {
  getCookies(): string;
  setCookie(cookie: string): void;
  subscribe(listener: VoidFunction): VoidFunction;
}
