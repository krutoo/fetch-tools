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

export interface ConfigureFetchOptions {
  Request?: typeof Request;
}

/**
 * Enhance fetch function by provided enhancer.
 * @param fetchFn Fetch function.
 * @param enhance Enhancer.
 */
export interface ConfigureFetch {
  <T extends typeof fetch>(fetchFn: T, enhance?: Enhancer): typeof fetch;
}
