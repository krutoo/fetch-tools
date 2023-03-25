/** Arguments of fetch merged in one object. */
export interface RequestConfig extends RequestInit {
  url: string;
}

/** Function that perform HTTP request (wrapper for fetch). */
export interface RequestFunction {
  (config: RequestConfig): Promise<Response>;
}

/** Request function enhancer. */
export interface Enhancer {
  (requestFn: RequestFunction): RequestFunction;
}

/** HTTP Request process middleware. */
export interface Middleware {
  (config: RequestConfig, next: RequestFunction): Promise<Response>;
}

/** Simple cookie store. */
export interface CookieStore {
  getCookies(): string;
  setCookie(cookie: string): void;
}
