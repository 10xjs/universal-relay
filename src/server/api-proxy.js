import compose from 'lodash/flowRight';

import proxy from 'http-middleware-metalab/middleware/proxy';

import {API_URL} from 'config';

export const mapPath = (map) => (app) => {
  const {request, upgrade} = app;

  const updateURL = (req) => {
    req.url = map(req.url);
    return req;
  };

  return {
    ...app,
    request: (req, res) => request(updateURL(req), res),
    upgrade: (req, socket, head) =>  upgrade(updateURL(req), socket, head),
  };
};

export default compose(
  mapPath(() => '/'),
  proxy({target: API_URL, changeOrigin: true}),
);
