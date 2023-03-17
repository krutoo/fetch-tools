import { configureFetch, applyMiddleware } from '../src';
import { baseURL, validateStatus, log } from '../src/middleware';

const myFetch = configureFetch(
  fetch,
  applyMiddleware([
    baseURL('https://jsonplaceholder.typicode.com/'),
    validateStatus(status => status >= 200 && status < 300),
    log({ onCatch: ({ error }) => console.error(error) }),
  ]),
);

myFetch('posts/1')
  .then(res => res.json())
  .then(console.log);
