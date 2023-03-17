export interface RequestConfig extends RequestInit {
  url: string;
}

export interface RequestFunction {
  (config: RequestConfig): Promise<Response>;
}

export interface Enhancer {
  (requestFn: RequestFunction): RequestFunction;
}

export interface Middleware {
  (config: RequestConfig, next: RequestFunction): Promise<Response>;
}
