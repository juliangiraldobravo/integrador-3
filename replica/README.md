# Réplica ligera de la API (Node/Express)

Replica en memoria los endpoints del backend Java: `/usuarios`, `/login` y `/eventos`.
Sirve además la interfaz de `public/index.html`.

    npm install
    node server.js        # http://localhost:8080

Los datos se pierden al reiniciar (igual que H2 en memoria).

Rutas: `/usuarios` (GET, POST, PUT `/:id`, PUT `/:id/password`), `/login`, `/eventos` (GET, POST, GET/DELETE `/:id`).
Usuarios con foto, país, municipio y dirección; eventos con fecha, país, municipio y autor.
Nota: no usa tokens de sesión (igual que el backend original), es solo para pruebas locales.
