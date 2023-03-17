import { configureFetch, applyMiddleware } from '../src';
import { baseURL, validateStatus, log } from '../src/middleware';

const myFetch = configureFetch(
  fetch,
  applyMiddleware([
    baseURL('https://www.sima-land.ru/api/v3/'),
    validateStatus(status => status >= 200 && status < 300),
    log({ onCatch: ({ error }) => console.error(error) }),
  ]),
);

// ...and using it like normal fetch
myFetch('currency/')
  .then(res => res.json())
  .then(console.log);
