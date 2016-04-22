import {createElement} from 'react';
import {renderToString, renderToStaticMarkup} from 'react-dom/server';
import escape from 'htmlescape';

import createContext from 'context';
import Page from 'component/page';
import Root from 'component/root';

import {API_URL} from 'config';

function render(element, context) {
  function iterate(iteration = 1) {
    return new Promise((resolve) => {
      // Render the element tree to an HTML string. renderToString does not
      // execute the full component lifecycle, but does call componentWillMount.
      // This gives any Relay containers the opportunity to run queries, which
      // are stored in the context.
      const markup = renderToString(element);

      // Retrieve and clear the stored promises from the context. This returns
      // an array of js promises representing each query that was run during the
      // current render iteration. Each promise will resolve in turn as each
      // query result is returned from the GraphQL endpoint.
      const promises = context.flushPromises();

      if (iteration === 4) {
        // We have reached the maximum number of recursive render iterations.
        // Avoid a potentially endless loop and return the most recent render
        // result to the client.
        return resolve(markup);
      }

      if (!promises.length) {
        // The current render iteration did not run any queries, this means the
        // rendered markup is ready to be delivered to the client.
        return resolve(markup);
      }

      // Wait for all of the relay queries to resolve then start another render
      // iteration.
      return Promise.all(promises).then(() => {
        resolve(iterate(iteration + 1));
      });
    });
  }

  return iterate();
}

export default function(app) {
  return {
    ...app,
    request(req, res) {
      // request MUST be kept as a "pure" function. Any data pertinent to a
      // single request cannot extend beyond the scope of this function.
      // createContext() is used to create a new context for each request,
      // including a RelayEnvironment instance.

      // RelayDefaultNetworkLayer by default will send GraphQL query requests
      // to the relative URL /graphql, which works fine on the client but would
      // fail on the server. Here we need to specify an absolute URL to the
      // GraphQL endpoint for the server's sake.
      const context = createContext({apiURL: API_URL});
      const {relayEnvironment} = context;

      // Call render providing the context instance. render returns a promise
      // which resolves with the rendered HTML result after all of the queries
      // for any Relay containers are done.
      render(<Root relayEnvironment={relayEnvironment} />, context)
        .then((markup) => {
          // Stringify the saved query results to JSON using htmlescape.
          const state = escape(context.getRelayState());

          // Use React to generate the HTML page layout.
          const body = `<!DOCTYPE html>${
            renderToStaticMarkup(<Page markup={markup} state={state} />)
          }`;

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(body);
        });
    },
  };
}
