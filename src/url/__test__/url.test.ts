import { describe } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { resetParams, setParams, withoutParams, withParams } from '../url.ts';

describe('withParams', () => {
  const input = new URL('http://hello.com?foo=1&bar=2');

  expect(input.searchParams.get('foo')).toBe('1');
  expect(input.searchParams.get('bar')).toBe('2');

  const output = withParams(input, { foo: null, bar: 3, baz: 4 });

  expect(output.searchParams.get('foo')).toBe(null);
  expect(output.searchParams.get('bar')).toBe('3');
  expect(output.searchParams.get('baz')).toBe('4');
});

describe('withoutParams', () => {
  const input = new URL('http://hello.com?foo=1&bar=2');

  expect(input.searchParams.get('foo')).toBe('1');
  expect(input.searchParams.get('bar')).toBe('2');

  const output = withoutParams(input);

  expect(output.searchParams.get('foo')).toBe(null);
  expect(output.searchParams.get('bar')).toBe(null);
  expect(output.searchParams.get('baz')).toBe(null);
});

describe('setParams', () => {
  const input = new URL('http://hello.com?foo=1&bar=2');

  expect(input.searchParams.get('foo')).toBe('1');
  expect(input.searchParams.get('bar')).toBe('2');

  const output = setParams(input, { foo: null, bar: 3, baz: 4 });

  expect(Object.is(input, output)).toBe(true);
  expect(output.searchParams.get('foo')).toBe(null);
  expect(output.searchParams.get('bar')).toBe('3');
  expect(output.searchParams.get('baz')).toBe('4');
});

describe('resetParams', () => {
  const input = new URL('http://hello.com?foo=1&bar=2');

  expect(input.searchParams.get('foo')).toBe('1');
  expect(input.searchParams.get('bar')).toBe('2');

  const output = resetParams(input);

  expect(Object.is(input, output)).toBe(true);
  expect(input.searchParams.get('foo')).toBe(null);
  expect(input.searchParams.get('bar')).toBe(null);
  expect(input.searchParams.get('baz')).toBe(null);
});
