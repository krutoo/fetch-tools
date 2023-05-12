import { configureFetch, applyMiddleware } from '../src';
import { validateStatus } from '../src/middleware';

const myFetch = configureFetch(
  fetch,
  applyMiddleware(validateStatus(status => status >= 200 && status < 300)),
);

myFetch('/posts/1')
  .then(res => res.json())
  .then(console.log);
