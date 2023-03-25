import { configureFetch, applyMiddleware } from '../src';
import { baseURL, validateStatus } from '../src/middleware';

const myFetch = configureFetch(
  fetch,
  applyMiddleware(
    baseURL('https://jsonplaceholder.typicode.com/'),
    validateStatus(status => status >= 200 && status < 300),
  ),
);

myFetch('posts/1')
  .then(res => res.json())
  .then(console.log);
