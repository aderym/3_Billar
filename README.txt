OSP BILLIARDS PLAY — HOSTINGER NODE.JS PACKAGE

This package contains the current site (including the 8-ball training table),
its API, and a local SQLite database adapter. The editable website files are
in public/: index.html, styles.css, app.js, qr.js, triple.js,
brackets.bundle.js, assets/. Changes to those files appear after reloading.
Use Hostinger VPS or a Hostinger
plan with Node.js 22.13+ application support and persistent writable storage.
It cannot run by uploading index.html into PHP-only public_html.

INSTALL
1. Upload and extract the ZIP into an application directory outside public_html.
   Keep the public/, server/, schema/ and worker/ folders together.
2. Set the Node.js app start command to `npm start`, or run `node server/index.mjs`.
   Set the application directory to the extracted folder. No npm install is needed.
3. From that directory, run `npm run setup` in a terminal to create the first
   administrator. The setup command asks for the venue and credentials. Password
   input is visible while typing; use a private terminal. Run again to create
   additional venues if needed. Existing venue administrators can add users and
   other venues from the application.
4. Set PORT to the port assigned by Hostinger (the server defaults to 3000).
   Attach an HTTPS domain to the application via Hostinger's reverse proxy.
   Forward the Host header and X-Forwarded-Proto: https.
5. Open the domain and sign in. Keep the storage/ directory backed up; it holds
   the SQLite database and uploaded profile photos. Set OSP_DATA_DIR to a
   persistent directory outside the app if your host resets application files.

The live Sites deployment and this installation have separate databases.
Accounts, passwords, photos and tournament history are NOT automatically
migrated. Export the tournament JSON from the current site, then import it on
Hostinger. Create the player accounts again on the Hostinger installation.

Requirements: Node.js >= 22.13.0 with the built-in node:sqlite module, disk
write access and HTTPS. No third-party npm dependencies. The WebRTC camera
feature still depends on browser camera permissions and network connectivity.

To confirm the server is running, visit /health. The first setup is via the
terminal because Sites' owner identity is not provided by Hostinger. Keep the
application directory and storage inaccessible from the web document root.
