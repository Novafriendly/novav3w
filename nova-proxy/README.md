# Nova shared proxy
Search, apps and packaged games use this directory. Bundled browser files are checked in; runtime-versions.json records their exact npm versions.

Local game HTML is loaded from this site's game folders by game-transport.js and rewritten by Scramjet. External assets use the same /api/wisp/ relay as Search. The nova-games.invalid origin is an internal routing name, never a remote server.

Serve Nova over HTTP localhost or HTTPS; file:// cannot run the service worker.
