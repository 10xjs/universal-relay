import compose from 'lodash/flowRight';

import base from './partial/base.webpack.config';
import entry from 'webpack-config-entry';

export default compose(
  // Include the base webpack config.
  base,

  // Define a new webpack entry.
  entry({name: 'server', output: 'build/server'}),
)({target: 'node'});
