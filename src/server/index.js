import compose from 'lodash/flowRight';

import base from 'http-middleware-metalab/base';
import assets from 'http-middleware-metalab/middleware/assets';
import empty from 'http-middleware-metalab/middleware/empty';
import match from 'http-middleware-metalab/middleware/match';
import path from 'http-middleware-metalab/middleware/match/path';

import devAssets from 'webpack-udev-server/runtime/dev-assets';

import {API_PATH} from 'config';

import apiProxy from './api-proxy';
import render from './render';
import error from './error';

// Location of the generated webpack stats file, relative to the project root.
const STATS_PATH = './build/client/stats.json';

export default compose(
  // Proxy localhost/graphql to remote url.
  match(path(API_PATH), apiProxy),

  base({locales: ['en-US']}),

  // Serve webpack assets.
  process.env.IPC_URL ? devAssets(STATS_PATH) : assets(STATS_PATH),

  render,

  // Render error page.
  error,

  empty,
);
