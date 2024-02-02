import assert from 'node:assert';
import { configureFetch } from '@krutoo/fetch-tools';
import { log, cookie, defaultHeaders, validateStatus } from '@krutoo/fetch-tools/middleware';

assert.equal(typeof configureFetch, 'function');
assert.equal(typeof log, 'function');
assert.equal(typeof cookie, 'function');
assert.equal(typeof defaultHeaders, 'function');
assert.equal(typeof validateStatus, 'function');
