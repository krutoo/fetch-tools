import { configureFetch, applyMiddleware } from '@krutoo/fetch-tools';
import { validateStatus } from '@krutoo/fetch-tools/middleware';

console.assert(typeof configureFetch === 'function');
console.assert(typeof applyMiddleware === 'function');

const myFetch = configureFetch(
  fetch,
  applyMiddleware(validateStatus(status => status >= 200 && status < 300)),
);

myFetch('https://jsonplaceholder.typicode.com/posts/1')
  .then(res => res.json())
  .then(console.log);
