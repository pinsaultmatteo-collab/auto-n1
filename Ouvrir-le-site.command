#!/bin/bash
# Double-cliquez pour lancer la démo du site AUTO N°1 dans votre navigateur.
cd "$(dirname "$0")/site" || exit 1
PORT=8790
( sleep 1; open "http://localhost:$PORT/" ) &
echo "Site AUTO N°1 servi sur http://localhost:$PORT — fermez cette fenêtre pour arrêter."
python3 -m http.server $PORT
