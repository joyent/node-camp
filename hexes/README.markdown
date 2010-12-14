# Hexes

This is a simple game that uses a remote nodejs server to sync up piece movements between all players.

Before you can run this, you need connect, and socket.io libraries installed.

Install node + npm, and then install the deps with:

    npm install connect socket.io

To start the server simply type the following in this folder:

    node server.js

You can also use npm to do both steps:

    npm link # or `npm install` for non-link install
    npm start hexes

Then go to http://localhost:8080/ in a webkit browser (chrome, safari, etc..) to see the game served from your local laptop.

To play, simply click (or tap) on a piece, and then click where you want it to go.  Open the same url in a couple browser windows to see them stay synced.

# iOS Install

Go to the url in Safari and add to desktop as an icon.  Then when you launch this icon, it will appear as a local native app, but really load from your server/laptop.

# webOS Experiments

To test on the device, you need to modify the url in web/client.js to point to your server from the phone's point of view.

Then you plug up the phone via USB (assuming you have the Palm SDK installed) and run the local launch script:

    ./launch.sh

Also you can run the node server on the phone.  To do this, install the nodeFor145 package on the phone or emulator (unless you have webOS 2.0 already)

Then just wget this entire repo from github using the download link, untar it, and run `node server.js` from the this folder on the phone.
    
