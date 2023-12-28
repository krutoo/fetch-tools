import assert from 'node:assert';
import { describe, test } from 'node:test';
import { applyMiddleware } from '../configure';
import { Middleware } from '../types';

describe('applyMiddleware', () => {
  test('should apply middleware in the order in which they are passed', async () => {
    const log: string[] = [];

    const foo: Middleware = async (request, next) => {
      log.push('<foo>');
      const result = await next(request);
      log.push('</foo>');
      return result;
    };

    const bar: Middleware = async (request, next) => {
      log.push('<bar>');
      const result = await next(request);
      log.push('</bar>');
      return result;
    };

    const baz: Middleware = async (request, next) => {
      log.push('<baz>');
      const result = await next(request);
      log.push('</baz>');
      return result;
    };

    const enhancer = applyMiddleware(foo, bar, baz);

    const handler = enhancer(() => {
      log.push('<handler />');
      return new Response('Test');
    });

    await handler(new Request('https://fake.com/for-tests'));

    assert.deepStrictEqual(log, [
      // expected log
      '<foo>',
      '<bar>',
      '<baz>',
      '<handler />',
      '</baz>',
      '</bar>',
      '</foo>',
    ]);
  });
});
