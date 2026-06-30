const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());

const events = [
  { id: 1, name: 'Concert Rock', available: 2 },
  { id: 2, name: 'Conférence Tech', available: 5 }
];

// réservations : id -> { id, eventId, status }
const reservations = new Map();

app.get('/events', (req, res) => {
  res.json(events);
});

app.post('/events/:id/reserve-temp', (req, res) => {
  const eventId = Number(req.params.id);
  const ev = events.find(e => e.id === eventId);
  if (!ev) return res.status(404).json({ error: "Événement non trouvé" });
  if (ev.available <= 0) return res.status(409).json({ error: 'Plus de places disponibles' });
  ev.available -= 1;
  const resId = uuidv4();
  reservations.set(resId, { id: resId, eventId, status: 'en_attente' });
  res.json({ reservationId: resId });
});

app.post('/reservations/:resId/confirm', (req, res) => {
  const resId = req.params.resId;
  const r = reservations.get(resId);
  if (!r) return res.status(404).json({ error: "Réservation introuvable" });
  if (r.status !== 'en_attente') return res.status(400).json({ error: "Réservation non en attente" });
  r.status = 'confirmee';
  reservations.set(resId, r);
  res.json({ ok: true });
});

app.post('/reservations/:resId/cancel', (req, res) => {
  const resId = req.params.resId;
  const r = reservations.get(resId);
  if (!r) return res.status(404).json({ error: "Réservation introuvable" });
  if (r.status === 'annulee' || r.status === 'confirmee') return res.status(400).json({ error: "Impossible d'annuler" });
  r.status = 'annulee';
  
  // restituer la place
  const ev = events.find(e => e.id === r.eventId);
  if (ev) ev.available += 1;
  reservations.set(resId, r);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Service inventaire démarré sur le port ${PORT}`));
