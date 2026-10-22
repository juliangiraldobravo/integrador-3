# Réplica ligera de la API (Node/Express)

Replica en memoria los endpoints del backend Java: `/usuarios`, `/login` y `/eventos`.
Sirve además la interfaz de `public/index.html`.

    npm install
    node server.js        # http://localhost:8080

Los datos se pierden al reiniciar (igual que H2 en memoria).
