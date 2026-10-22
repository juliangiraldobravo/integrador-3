// Réplica ligera del backend Spring Boot "astrologic" (datos en memoria, como H2 mem).
// Rutas: GET/POST /usuarios, POST /login, GET/POST /eventos, GET/DELETE /eventos/:id
const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(express.json());
app.use((req, res, next) => {            // equivalente a @CrossOrigin("*")
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const hash = (p) => crypto.createHash("sha256").update(String(p)).digest("hex");
const db = { usuarios: [], eventos: [], uid: 1, eid: 1 };

const sinPassword = ({ password, ...u }) => u;

app.get("/usuarios", (req, res) => res.json(db.usuarios.map(sinPassword)));
app.post("/usuarios", (req, res) => {
  const { nombre, correo, password } = req.body || {};
  if (!nombre || !correo || !password)
    return res.status(400).json({ error: "nombre, correo y password son obligatorios" });
  if (db.usuarios.some((u) => u.correo === correo))
    return res.status(409).json({ error: "El correo ya está registrado" });
  const u = { id: db.uid++, nombre, correo, password: hash(password) };
  db.usuarios.push(u);
  res.json(sinPassword(u));
});

app.post("/login", (req, res) => {
  const { correo, contrasena } = req.body || {};
  const u = db.usuarios.find((x) => x.correo === correo && x.password === hash(contrasena));
  if (!u) return res.sendStatus(401);
  res.json(sinPassword(u));
});

app.get("/eventos", (req, res) => res.json(db.eventos));
app.post("/eventos", (req, res) => {
  const { nombre, descripcion } = req.body || {};
  if (!nombre) return res.status(400).json({ error: "nombre es obligatorio" });
  const e = { id: db.eid++, nombre, descripcion: descripcion || "" };
  db.eventos.push(e);
  res.json(e);
});
app.get("/eventos/:id", (req, res) => {
  const e = db.eventos.find((x) => x.id === Number(req.params.id));
  e ? res.json(e) : res.sendStatus(404);
});
app.delete("/eventos/:id", (req, res) => {
  db.eventos = db.eventos.filter((x) => x.id !== Number(req.params.id));
  res.sendStatus(200);
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Astrologic réplica en http://localhost:${PORT}`));
