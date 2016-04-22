/* eslint-env node */
import http from 'http';
import {connect} from 'http-middleware-metalab';

import createServer from 'server';

const server = connect(createServer(), http.createServer());

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});

server.listen(process.env.PORT);
