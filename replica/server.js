// Réplica ligera del backend "astrologic" (datos en memoria).
// /usuarios (GET, POST, PUT /:id, PUT /:id/password), /login, /eventos (GET, POST, GET/DELETE /:id)
const express = require("express"), crypto = require("crypto"), path = require("path");
const app = express();
app.use(express.json({ limit: "2mb" }));
app.use((req, res, next) => {
  res.set({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS" });
  req.method === "OPTIONS" ? res.sendStatus(204) : next();
});
const hash = (p) => crypto.createHash("sha256").update(String(p)).digest("hex");
const db = { usuarios: [], eventos: [], uid: 1, eid: 1 };
const pub = ({ password, ...u }) => u;

app.get("/usuarios", (req, res) => res.json(db.usuarios.map(pub)));
app.post("/usuarios", (req, res) => {
  const { nombre, correo, password } = req.body || {};
  if (!nombre || !correo || !password) return res.status(400).json({ error: "nombre, correo y password son obligatorios" });
  if (db.usuarios.some((u) => u.correo === correo)) return res.status(409).json({ error: "El correo ya está registrado" });
  const u = { id: db.uid++, nombre, correo, password: hash(password), avatar: "", pais: "", municipio: "", direccion: "" };
  db.usuarios.push(u); res.json(pub(u));
});
app.put("/usuarios/:id", (req, res) => {
  const u = db.usuarios.find((x) => x.id === Number(req.params.id));
  if (!u) return res.sendStatus(404);
  const b = req.body || {};
  if (b.correo && db.usuarios.some((x) => x.correo === b.correo && x.id !== u.id)) return res.status(409).json({ error: "Ese correo ya está en uso" });
  for (const k of ["nombre", "correo", "avatar", "pais", "municipio", "direccion"]) if (typeof b[k] === "string") u[k] = b[k];
  db.eventos.forEach((e) => { if (e.autorId === u.id) e.autor = u.nombre; });
  res.json(pub(u));
});
app.put("/usuarios/:id/password", (req, res) => {
  const u = db.usuarios.find((x) => x.id === Number(req.params.id));
  const { actual, nueva } = req.body || {};
  if (!u) return res.sendStatus(404);
  if (u.password !== hash(actual)) return res.status(403).json({ error: "La contraseña actual no es correcta" });
  if (!nueva || String(nueva).length < 4) return res.status(400).json({ error: "La nueva contraseña es muy corta" });
  u.password = hash(nueva); res.json({});
});
app.post("/login", (req, res) => {
  const { correo, contrasena } = req.body || {};
  const u = db.usuarios.find((x) => x.correo === correo && x.password === hash(contrasena));
  u ? res.json(pub(u)) : res.sendStatus(401);
});

app.get("/eventos", (req, res) => res.json(db.eventos));
app.post("/eventos", (req, res) => {
  const { nombre, descripcion, fecha, pais, municipio, autorId, autor } = req.body || {};
  if (!nombre) return res.status(400).json({ error: "nombre es obligatorio" });
  const e = { id: db.eid++, nombre, descripcion: descripcion || "", fecha: fecha || "", pais: pais || "", municipio: municipio || "", autorId: autorId || null, autor: autor || "" };
  db.eventos.push(e); res.json(e);
});
app.get("/eventos/:id", (req, res) => {
  const e = db.eventos.find((x) => x.id === Number(req.params.id));
  e ? res.json(e) : res.sendStatus(404);
});
app.delete("/eventos/:id", (req, res) => { db.eventos = db.eventos.filter((x) => x.id !== Number(req.params.id)); res.sendStatus(200); });

app.use(express.static(path.join(__dirname, "public")));
app.listen(process.env.PORT || 8080, () => console.log("Astrologic réplica en http://localhost:" + (process.env.PORT || 8080)));
