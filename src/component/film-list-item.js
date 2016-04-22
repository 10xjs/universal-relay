import Relay, {createContainer} from 'react-relay';
import {createElement} from 'react';

function FilmListItem({film: {title, episodeID}}) {
  return <div>{`Episode ${episodeID}: ${title}`}</div>;
}

export default createContainer(FilmListItem, {
  fragments: {
    film: () => Relay.QL`
      fragment on Film {
        title
        episodeID
      }
    `,
  },
});
