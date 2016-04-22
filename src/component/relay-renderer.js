import Relay from 'react-relay';
import {PropTypes} from 'react';
import {Renderer as BaseRenderer} from 'react-relay';

import checkRelayQueryData from 'react-relay/lib/checkRelayQueryData';
import flattenSplitRelayQueries from
  'react-relay/lib/flattenSplitRelayQueries';
import splitDeferredRelayQueries from
  'react-relay/lib/splitDeferredRelayQueries';

// Check the RelayEnvironment to determine if cached query results are capable
// of satisfying a set of queries. Returns two flags, "done" if all queries,
// required or deferred are satisfied and "ready" if all required queries are
// satisfied.
function checkCache(environemnt, querySet) {
  const queuedStore = environemnt.getStoreData().getQueuedStore();
  let done = true;

  // Calculate a "ready" state by checking that all required queries can be
  // satisfied by the cached store data.
  const ready = Object.keys(querySet).every((key) => {
    // flattenSplitRelayQueries combined with splitDeferredRelayQueries is used
    // to split deferred queries from a query set and flatten any duplication.
    return flattenSplitRelayQueries(splitDeferredRelayQueries(querySet[key]))
      .every((query) => {
        // Check that the data required to satisfy the query exists in the
        // queuedStore.
        if (!checkRelayQueryData(queuedStore, query)) {
          done = false;

          // If the query is required (not deferred) and it its data is not
          // available, consider the "ready" state to be false. i.e. we have
          // discovered that there are required required query results that are
          // missing from the store.
          if (!query.isDeferred()) {
            return false;
          }
        }

        return true;
      });
  });

  return {done, ready};
}

export default class RelayRenderer extends BaseRenderer {
  constructor(props, context) {
    super(props, context);

    // Override the "mounted" property set in the super constructor. This will
    // prevent the RelayRenderer component from attempting to respond to a
    // ready state change, which would have no value on the server.
    this.mounted = false;
  }

  componentWillMount() {
    const {Container, forceFetch, queryConfig, environment} = this.props;
    const querySet = Relay.getQueries(Container, queryConfig);

    // Check the cached query results to determine if the required queries are
    // able to be satisfied without additional fetches.
    const {done, ready} = checkCache(environment, querySet);

    if (ready) {
      // If the cache is "ready" i.e. all of the required queries are satisfied
      // by data cached in the Relay store, set the component's initial ready
      // state to true. By default a RelayRender instance is initialized with
      this.state.readyState = {
        aborted: false,
        done: done && !forceFetch,
        error: null,
        mounted: false,
        ready: true,
        stale: !!forceFetch,
      };

      // If active is false the component's readyState is ignored and instead a
      // default readyState is used in render.
      this.state.active = true;
    }

    if (!ready || forceFetch) {
      // If the required queries have not been satisfied call _runQueries.
      this._runQueries(this.props);
    }
  }

  // Replace the inherited componentDidMount which calls _runQueries. Since we
  // are now conditionally calling _runQueries from componentWillMount, we do
  // not want it to be called here.
  componentDidMount() {
    // Set default mounted property to restore proper client component behavior.
    this.mounted = true;
  }
}

RelayRenderer.propTypes = {
  ...BaseRenderer.propTypes,
  fetchOnMount: PropTypes.bool,
};
