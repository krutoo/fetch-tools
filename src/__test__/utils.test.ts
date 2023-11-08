import assert from 'node:assert';
import { describe, test } from 'node:test';
import { createCookieStore } from '../utils';

describe('createCookieStore', () => {
  test('regular initial cookies should not throw exceptions', () => {
    assert.equal(createCookieStore('aaa=; bbb=222').getCookies(), 'aaa=; bbb=222');
  });

  test('initial cookies with empty values should not throw exceptions', () => {
    assert.equal(createCookieStore('aaa=; bbb=222').getCookies(), 'aaa=; bbb=222');
  });

  test('store should save initial cookies', () => {
    const store = createCookieStore('aaa=111; bbb=222; ccc=333');
    assert.equal(store.getCookies(), 'aaa=111; bbb=222; ccc=333');
  });

  test('store should save new cookies', () => {
    const store = createCookieStore('aaa=111; bbb=222; ccc=333');
    assert.equal(store.getCookies(), 'aaa=111; bbb=222; ccc=333');

    store.setCookie('ddd=444');
    assert.equal(store.getCookies(), 'aaa=111; bbb=222; ccc=333; ddd=444');
  });
});
