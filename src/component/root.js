import {createElement} from 'react';
import Relay, {Route} from 'react-relay';

import Renderer from 'component/relay-renderer.js';
import FilmList from 'component/film-list';

class FilmsQueryConfig extends Route {
  static queries = {
    allFilms: () => Relay.QL`query { allFilms }`,
  };
  static routeName = 'FilmsQueryConfig';
}

export default function Root({relayEnvironment}) {
  return (
    <div>
      <h1>Universal Relay</h1>

      <Renderer
        environment={relayEnvironment}
        Container={FilmList}
        queryConfig={new FilmsQueryConfig}
        render={({props}) => {
          if (props) {
            return <FilmList {...props}/>;
          }

          return <div>Loading...</div>;
        }}
      />
    </div>
  );
}
