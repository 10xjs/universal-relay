import compose from 'lodash/flowRight';
import identity from 'lodash/identity';

import sourceMaps from 'webpack-config-source-maps';
import devServer from 'webpack-config-dev-server';
import optimize from 'webpack-config-optimize';
import babel from 'webpack-config-babel';
import stats from 'webpack-config-stats';
import root from 'webpack-config-root';
import json from 'webpack-config-json';
import hot from 'webpack-config-hot';

import env from './env.webpack.config';
import fetch from './fetch.webpack.config';
import promise from './promise.webpack.config';

export default compose(
  // Define required environment variables.
  env,

  // Polyfill fetch for server and client.
  fetch,

  // Polyfill Promise with bluebird.
  promise,

  // Conditionally minify bundle in production environment.
  process.env.NODE_ENV === 'production' ? optimize() : identity,

  // Dev server with client side hot reloading.
  process.env.NODE_ENV !== 'production' ? compose(
    devServer(),
    hot(),
  ) : identity,

  // Generate sourcemaps.
  sourceMaps({}),

  // Automatically resolve modules within the src directory. This prevents the
  // need for using relative paths everywhere.
  root('src'),

  // Write a stats.json file to the build directory listing generated assets.
  stats(),

  // Set up a loader for json files.
  json(),

  // Set up a loader for es6/jsx files.
  babel(),
);
