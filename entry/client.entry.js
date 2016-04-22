/* eslint-env browser */

// The client entry module serves a very specific purpose. By isolating side
// effect DOM calls to the entry module and keeping them out of the src
// directory, we can trust that anything within src can be safely imported
// outside of the DOM environment. This is only a concern because the DOM calls
// here are side effects of importing this module, i.e. they are run implicitly
// on import. By following this convention, we won't have to worry about
// inadvertently starting the app in a testing environment.

import render from 'client';

render(document.getElementByID('state'), document.getElementByID('app'));
