import path from 'path';
import mkdirp from 'mkdirp';
import url from 'url';
import fs from 'fs';
import http from 'http';
import https from 'https';

import packageJSON from '../package.json';
import introspectionQuery from './introspection-query-0.4.10.js';

import {API_URL} from '../src/config';

const parsedUrl = url.parse(API_URL);

const schemaPath = packageJSON.metadata.graphql.schema;

const req = (parsedUrl.protocol === 'https:' ? https : http)
  .request(Object.assign(parsedUrl, {
    headers: {'Content-Type': 'application/graphql'},
    method: 'POST',
  }),
  (res) => {
    res.on('error', (err) => {
      throw err;
    });

    mkdirp(path.dirname(schemaPath), (err) => {
      if (err) {
        throw err;
      }

      res.pipe(fs.createWriteStream(schemaPath));
    });
  });

req.write(introspectionQuery);
req.end();
