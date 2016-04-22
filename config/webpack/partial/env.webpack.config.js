import webpack from 'webpack';
import partial from 'webpack-partial';

export default (config) => partial(config, {
  plugins: [
    new webpack.DefinePlugin(config.target !== 'node' ? {
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    } : {}),
  ],
});
