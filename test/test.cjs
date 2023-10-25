const fs = require('fs/promises');
const path = require('node:path');
const assert = require('node:assert');

async function testExports() {
  const pkg = JSON.parse(await fs.readFile('../package.json', 'utf-8'));

  assert.equal(pkg.name, '@krutoo/fetch-tools');

  for (const pathname of Object.keys(pkg.exports)) {
    const specifier = path.join(pkg.name, pathname);

    assert.doesNotThrow(() => require(specifier));
  }
}

async function testBaseFunctionality() {
  const { configureFetch, applyMiddleware } = require('@krutoo/fetch-tools');
  const { validateStatus } = require('@krutoo/fetch-tools/middleware');

  assert.equal(typeof configureFetch, 'function');
  assert.equal(typeof applyMiddleware, 'function');

  const myFetch = configureFetch(fetch, applyMiddleware(validateStatus(status => status === 200)));

  assert.equal(typeof myFetch, 'function');
}

Promise.resolve().then(testExports).then(testBaseFunctionality);
