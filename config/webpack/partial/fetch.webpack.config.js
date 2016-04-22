import webpack from 'webpack';
import partial from 'webpack-partial';

export default (config) => partial(config, {
  plugins: [
    new webpack.ProvidePlugin({
      fetch: config.target === 'node'
        ? require.resolve('node-fetch')
        : `!${require.resolve('imports-loader')}?this=>global` +
          `!${require.resolve('exports-loader')}?global.fetch` +
          `!${require.resolve('whatwg-fetch')}`,
    }),
  ],
});
