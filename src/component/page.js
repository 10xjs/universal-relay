import {createElement} from 'react';

export default function Page({markup, state}) {
  return (
    <html>
      <head>
       <title>Universal Relay</title>
      </head>
      <body>
        <div id='app' dangerouslySetInnerHTML={{__html: markup}} />
        <script type='application/json' id='state'>{state}</script>
        <script src='bundle.js'></script>
      </body>
    </html>
  );
}
