# Fetch tools

Set of utilities for JavaScript
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

## Goals

- do not change `fetch` behavior, just add some features
- ability to run in browser, Node.js, Deno, Bun, WinterJS (...any runtime that implements Fetch API)
- zero dependencies

## Installation

```bash
# in Node.js via NPM
npm add @krutoo/fetch-tools

# in Deno via JSR
deno add @krutoo/fetch-tools

# in Bun
bun add @krutoo/fetch-tools
```

## Usage

Creating fetch with some extra features.

```ts
import { applyMiddleware, configureFetch } from '@krutoo/fetch-tools';
import { defaultHeaders, log, validateStatus } from '@krutoo/fetch-tools/middleware';

// configure your own fetch...
const myFetch = configureFetch(
  fetch,
  applyMiddleware(
    // validate status (like in axios)
    validateStatus((status) => status >= 200 && status < 300),
    // add default headers
    defaultHeaders({
      'user-agent': 'test',
    }),
    // log request stages (before request, after response, on catch)
    log({
      onCatch: ({ error }) => console.error(error),
    }),
  ),
);

// ...and using it like normal fetch
myFetch('posts/1')
  .then((res) => res.json())
  .then((data) => console.log(data));
```

## Middleware

Middleware are just functions and you can write your own.

```ts
async function myMiddleware(request, next) {
  try {
    // [do something before request here]

    const response = await next(request);

    // [do something after response here]

    return response;
  } catch (error) {
    // [do something on error here but don't forget throw error or return response]

    throw error;
  }
}
```

## Builtin middleware

### `validateStatus`

Returns a middleware that will validate status.

```ts
import { applyMiddleware, configureFetch } from '@krutoo/fetch-tools';
import { validateStatus } from '@krutoo/fetch-tools/middleware';

const myFetch = configureFetch(
  fetch,
  applyMiddleware(
    // fetch promise will be rejected when status is not valid
    validateStatus((status) => status >= 200 && status < 300),
  ),
);
```

### `defaultHeaders`

Returns a middleware that will set default headers to request.

```ts
import { applyMiddleware, configureFetch } from '@krutoo/fetch-tools';
import { defaultHeaders } from '@krutoo/fetch-tools/middleware';

const myFetch = configureFetch(
  fetch,
  applyMiddleware(
    // all requests will contain declared headers
    defaultHeaders({ 'user-agent': 'spy' }),
  ),
);
```

### `log`

Returns a middleware that will log phases by handler.

```ts
import { applyMiddleware, configureFetch } from '@krutoo/fetch-tools';
import { log } from '@krutoo/fetch-tools/middleware';

const myFetch = configureFetch(
  fetch,
  applyMiddleware(
    // each phase of request will be logged
    log({
      onRequest({ request }) {
        console.log(request);
      },

      onResponse({ request, response }) {
        console.log(response);
      },

      onCatch({ request, error }) {
        console.error(error);
      },
    }),
  ),
);
```

### `jwt`

Returns simplest JWT middleware. This middleware will add `Authorization` header to each request
that matches the condition.

```ts
import { applyMiddleware, configureFetch } from '@krutoo/fetch-tools';
import { jwt } from '@krutoo/fetch-tools/middleware';

const myFetch = configureFetch(
  fetch,
  applyMiddleware(
    jwt({
      // Access token
      token: '...',

      // Determines whether to add a header
      filter: req => req.url.includes('/api/'),
    })

    // ...or like this
    jwt({
      // "token" can be function that should return string or null or Promise<string | null>
      token: () => getJwtFromSomewhere(),
    })
  ),
);
```

### `proxy`

Returns simple proxy middleware. Useful for servers based on Fetch API.

```ts
import { applyMiddleware } from '@krutoo/fetch-tools';
import { proxy } from '@krutoo/fetch-tools/middleware';

const enhance = applyMiddleware(
  proxy({
    // pathname(s) of incoming request URL which will be proxied
    filter: ['/api/v2/', '/api/v3/'],

    // define target URL
    target: 'https://www.my-site.com/',
  }),
);

Deno.serve(
  enhance((req) => {
    return new Response('<h1>Main page</h1>');
  }),
);
```

## Server utilities

You can use utils for simply configure your HTTP server.

### In Deno

```ts
import { router } from '@krutoo/fetch-tools/server';

const handler = router
  .builder()
  .get('/', () => new Response('Home page'))
  .put('/about', () => new Response('About page'))
  .post('/news', () => new Response('News page'))
  .all('/stats', () => new Response('Some stats'))
  .build();

await Deno.serve({
  port: 8080,
  handler: handler,
});
```

### In Bun

```ts
import { router } from '@krutoo/fetch-tools/server';

const handler = router
  .builder()
  .get('/', () => new Response('Home page'))
  .put('/about', () => new Response('About page'))
  .post('/news', () => new Response('News page'))
  .all('/stats', () => new Response('Some stats'))
  .build();

Bun.serve({
  port: 8080,
  fetch: handler,
});
```

### In Node.js (`node:http` or `express`)

Currently there is no builtin server implementation based on Fetch API in Node.js.

It is possible to use _adapter_ for `node:http` or `express` from
[@whatwg-node/server](https://www.npmjs.com/package/@whatwg-node/server).

```ts
import { router } from '@krutoo/fetch-tools';
import { createServer } from 'node:http';
import { createServerAdapter } from '@whatwg-node/server';

const handler = router
  .builder()
  .get('/', () => new Response('Home page'))
  .put('/about', () => new Response('About page'))
  .post('/news', () => new Response('News page'))
  .all('/stats', () => new Response('Some stats'))
  .build();

const server = createServer(createServerAdapter(handler));

server.listen(8080);
```

### Middleware for servers

You can use middleware for server handlers too:

```ts
import { applyMiddleware } from '@krutoo/fetch-tools';
import { router } from '@krutoo/fetch-tools/server';
import { log } from '@krutoo/fetch-tools/middleware';

const enhance = applyMiddleware(
  log({
    onCatch: ({ error }) => console.error(error),
  }),
);

const handler = router
  .builder()
  .get('/', () => new Response('Home page'))
  .put('/about', () => new Response('About page'))
  .post('/news', () => new Response('News page'))
  .all('/stats', () => new Response('Some stats'))
  .build();

Bun.serve({
  port: 8080,
  fetch: enhance(handler), // just wrap handler to enhancer for apply middleware
});
```

### Working with HTTP cookie on server

Cookies can be used in different ways on the server.

### Browser like behavior

If you want to imitate browser behavior as much as possible in terms of working with cookies, you
can use `@krutoo/fetch-tools` together with `fetch-cookie`.

To use **fetch-cookie** as an middleware, follow
[these](https://github.com/valeriangalliat/fetch-cookie/issues/79#issuecomment-1672188226)
instructions.

### Microfrontends

Server part of the microfrontend can make requests to some HTTP API on behalf of the user, sending
his cookies in requests.

In this case you can use just `defaultHeaders` middleware:

```js
import { configureFetch, applyMiddleware } from '@krutoo/fetch-tools';
import { defaultHeaders } from '@krutoo/fetch-tools/middleware';

// example of server handler
async function handler(request: Request) {
  const myFetch = configureFetch(
    fetch,
    applyMiddleware(
      // forward cookie from incoming request to all outgoing requests
      defaultHeaders({ cookie: request.headers.get('cookie') }),
    ),
  );

  // this request will contain cookies from the incoming request
  const orders = await myFetch('http://something.com/api/user/orders').then(res => res.json());

  return new Response(JSON.stringify({ orders }), { 'content-type': 'application/json' });
}
```

## To do

- ~~JWT middleware~~
- ~~retry middleware~~
- ~~ability to use with Bun's `Bun.serve` and Deno's `serve` from `std/http`~~
