import { afterAll, beforeAll, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { applyMiddleware, configureFetch } from '#fetch';
import { retry } from '../retry.ts';
import { dump } from '#response';

const serverState = { counter: 3 };
let server: ReturnType<typeof Deno.serve>;

beforeAll(() => {
  server = Deno.serve((_req) => {
    if (serverState.counter > 0) {
      serverState.counter--;
      return new Response('FAIL', { status: 400 });
    }

    return new Response('SUCCESS', { status: 200 });
  });
});

afterAll(async () => {
  await server.shutdown();
});

it('Should fetch resource until it returns success response)', async () => {
  const fetch = configureFetch(globalThis.fetch, applyMiddleware(retry({ count: 10 })));

  expect(serverState.counter).toBe(3);
  const response = await fetch(
    new URL(`http://${server.addr.hostname}:${server.addr.port}`),
  );

  expect(serverState.counter).toBe(0);
  expect(response.ok).toBe(true);
  expect(await response.text()).toBe('SUCCESS');

  await dump(response);
});

it('Should break fetch loop when attempt limit is reached', async () => {
  const fetch = configureFetch(globalThis.fetch, applyMiddleware(retry({ count: 2 })));

  serverState.counter = 5;
  expect(serverState.counter).toBe(5);
  const response = await fetch(
    new URL(`http://${server.addr.hostname}:${server.addr.port}`),
  );

  expect(serverState.counter).toBe(3);
  expect(response.ok).toBe(false);
  expect(await response.text()).toBe('FAIL');

  await dump(response);
});
