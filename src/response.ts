export function html(...[body, options]: ConstructorParameters<typeof Response>) {
  const headers = new Headers(options?.headers);

  headers.set('content-type', 'text/html');

  return new Response(body, { ...options, headers });
}

export function json(...[body, options]: ConstructorParameters<typeof Response>) {
  const headers = new Headers(options?.headers);

  headers.set('content-type', 'application/json');

  return new Response(body, { ...options, headers });
}

export function notFound() {
  return new Response('Not found', { status: 404 });
}
