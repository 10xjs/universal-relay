import {createElement} from 'react';
import {render as reactRender} from 'react-dom';

import createContext from 'context';
import Root from 'component/root';

function getState(element) {
  return JSON.parse(element.textContent || element.innerText || '{}');
}

export function render(stateContainer, appContainer) {
  const initialState = getState(stateContainer);
  const context = createContext({initialState});
  const {relayEnvironment} = context;

  reactRender(<Root relayEnvironment={relayEnvironment} />, appContainer);
}
