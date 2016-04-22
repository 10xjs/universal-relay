import toGraphQL from 'react-relay/lib/toGraphQL';
import fromGraphQL from 'react-relay/lib/fromGraphQL';
import RelayEnvironment from 'react-relay/lib/RelayEnvironment';
import RelayDefaultNetworkLayer from 'react-relay/lib/RelayDefaultNetworkLayer';

import {API_PATH} from 'config';

export default function createContext({apiURL = API_PATH, initialState} = {}) {
  // Create a new RelayEnvironment instance. Relay inherently uses a singleton
  // RelayEnvironemnt instance if we do not provide our own. This would have
  // drastic negative consequences in the server environment where requests
  // from multiple users are handled within the same context. We would have
  // a Steam account page level disaster on our hands.
  const relayEnvironment = new RelayEnvironment();

  // Injecting a network layer is a necessary step when creating a
  // RelayEnvironment instance.
  const networkLayer = new RelayDefaultNetworkLayer(apiURL);
  relayEnvironment.injectNetworkLayer(networkLayer);

  // Store a reference to the RelayStoreData instance for convenience.
  const storeData = relayEnvironment.getStoreData();

  // An array in which all of the captured queries will be stored on the server.
  // The content of this array will be serialized and sent to the client in the
  // initial response.
  const queries = [];

  // Storage for promises representing the queries run during a given render
  // cycle. The iterative render resolver will use this to know when a render
  // iteration is complete.
  let promises = [];

  if (initialState) {
    // If initialState is provided, we will seed the RelayEnvironment will the
    // saved query results.
    initialState.forEach(([query, response]) => {
      // Call the query payload handler, the same that would be called for a
      // query that was run from within relay, with the query result captured
      // during the server render. fromGraphQL.Query is used to convert a plain
      // query object into a RelayQuery instance.
      storeData.handleQueryPayload(fromGraphQL.Query(query), response);
    });
  } else {
    // No initialState was provided. This will be the case on the server. Here
    // queries are captured to be serialized and delivered to the client as
    // intitialState.

    // In order to capture queries as they run, we need to patch the add method
    // of the PendingQueryTracker object within relay. This is a unique location
    // where we have both the source query and its request promise in the same
    // context. We need access to both of these objects within the same context
    // in order to achieve our goal.
    const pendingQueryTracker = storeData.getPendingQueryTracker();
    const {add} = pendingQueryTracker;

    // Replace the add method with our own that is referentially transparent
    // within the context of Relay.
    pendingQueryTracker.add = (...args) => {
      const pendingFetch = add.apply(pendingQueryTracker, args);

      // The private _fetchSubtractedQueryPromise property of a PendingFetch
      // instance represents the fetch request to the GraphQL endpoint.
      const promise = pendingFetch._fetchSubtractedQueryPromise;

      // Use toGraphQL.Query to get a serializable object representation of
      // the RelayQuery instance.
      const query = toGraphQL.Query(pendingFetch.getQuery());

      // When the query response resolves, store it in the queries array so it
      // can be serialized and delivered to the client as part of the initial
      // response.
      promise.then((response) => queries.push([query, response]));

      // Store the fetch promise so the iterative renderer can delay rendering
      // until the query resolves.
      promises.push(promise);

      // Return the result of the original function to achieve transparency.
      return pendingFetch;
    };
  }

  function flushPromises() {
    // Return and reset the promises array.
    const temp = promises;
    promises = [];
    return temp;
  }

  function getRelayState() {
    return queries;
  }

  return {relayEnvironment, getRelayState, flushPromises};
}
