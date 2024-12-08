import { test } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { defaultHeaders } from '../default-headers.ts';

test('strategy "set", should be default', async () => {
  const middleware = defaultHeaders({
    'content-type': 'application/json',
  });

  const request = new Request('https://foo.bar', {
    method: 'POST',
    body: JSON.stringify({ foo: 'bar' }),
  });

  expect(request.headers.get('Content-Type')).toBe('text/plain;charset=UTF-8');

  const next = (req: Request) => {
    state.request = req;
    return new Response('ok');
  };

  const state: { request: Request | null } = {
    request: null,
  };

  await middleware(request, next);

  expect(state.request?.headers.get('Content-Type')).toBe('application/json');
});

test('strategy "append"', async () => {
  const middleware = defaultHeaders({
    'content-type': 'application/json',
  }, {
    strategy: 'append',
  });

  const request = new Request('https://foo.bar', {
    method: 'POST',
    body: JSON.stringify({ foo: 'bar' }),
  });

  expect(request.headers.get('Content-Type')).toBe('text/plain;charset=UTF-8');

  const next = (req: Request) => {
    state.request = req;
    return new Response('ok');
  };

  const state: { request: Request | null } = {
    request: null,
  };

  await middleware(request, next);

  expect(state.request?.headers.get('Content-Type')).toBe(
    'text/plain;charset=UTF-8, application/json',
  );
});

test('strategy "defaults-set"', async () => {
  const middleware = defaultHeaders({
    'content-type': 'application/json',
  }, {
    strategy: 'defaults-set',
  });

  const request = new Request('https://foo.bar', {
    method: 'POST',
    body: JSON.stringify({ foo: 'bar' }),
  });

  expect(request.headers.get('Content-Type')).toBe('text/plain;charset=UTF-8');

  const next = (req: Request) => {
    state.request = req;
    return new Response('ok');
  };

  const state: { request: Request | null } = {
    request: null,
  };

  await middleware(request, next);

  expect(state.request?.headers.get('Content-Type')).toBe(
    'text/plain;charset=UTF-8',
  );
});

test('strategy "defaults-set"', async () => {
  const middleware = defaultHeaders({
    'content-type': 'application/json',
  }, {
    strategy: 'defaults-append',
  });

  const request = new Request('https://foo.bar', {
    method: 'POST',
    body: JSON.stringify({ foo: 'bar' }),
  });

  expect(request.headers.get('Content-Type')).toBe('text/plain;charset=UTF-8');

  const next = (req: Request) => {
    state.request = req;
    return new Response('ok');
  };

  const state: { request: Request | null } = {
    request: null,
  };

  await middleware(request, next);

  expect(state.request?.headers.get('Content-Type')).toBe(
    'application/json, text/plain;charset=UTF-8',
  );
});
