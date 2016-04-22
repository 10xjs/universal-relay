import {createElement} from 'react';
import Relay, {createContainer} from 'react-relay';

import FilmListItem from 'component/film-list-item';

function FilmList({allFilms}) {
  return (
    <div>
      {allFilms.films.map((film) => <FilmListItem key={film.id} film={film}/>)}
    </div>
  );
}

export default createContainer(FilmList, {
  fragments: {
    allFilms: () => Relay.QL`
      fragment on FilmsConnection {
        films {
          id
          ${FilmListItem.getFragment('film')}
        }
      }
    `,
  },
});
