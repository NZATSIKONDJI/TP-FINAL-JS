const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());

const ID_SVC = process.env.ID_SVC || 'http://localhost:3001';
const INV_SVC = process.env.INV_SVC || 'http://localhost:3002';
const PAY_SVC = process.env.PAY_SVC || 'http://localhost:3003';

// réservations : id -> { id, userId, eventId, status, reservationId }
const bookings = new Map();

app.post('/bookings', async (req, res) => {
  const { userId, eventId, amount, card } = req.body;
  const bookingId = uuidv4();
  const record = { id: bookingId, userId, eventId, status: 'en_attente' };
  bookings.set(bookingId, record);

  try {

    // 1. vérifier l'existence de l'utilisateur
    const userResp = await axios.get(`${ID_SVC}/users/${userId}`);
    if (!userResp.data) throw new Error("Utilisateur non trouvé");

    
    const reserveResp = await axios.post(`${INV_SVC}/events/${eventId}/reserve-temp`);
    const reservationId = reserveResp.data.reservationId;

    // 3. demander le paiement

    const payResp = await axios.post(`${PAY_SVC}/payments`, { amount, card });
    if (payResp.data.status === 'accepte') {
      // confirmer la réservation
      await axios.post(`${INV_SVC}/reservations/${reservationId}/confirm`);
      record.status = 'confirmee';
      record.reservationId = reservationId;
      bookings.set(bookingId, record);
      return res.status(201).json(record);
    } else {
      // paiement refusé : libérer la réservation
      await axios.post(`${INV_SVC}/reservations/${reservationId}/cancel`);
      record.status = 'paiement_echoue';
      record.reservationId = reservationId;
      record.paymentReason = payResp.data.reason || 'paiement_refuse';
      bookings.set(bookingId, record);
      return res.status(402).json(record);
    }
  } catch (err) {
   

    if (err.response && err.response.data && err.response.data.reservationId) {
      try { await axios.post(`${INV_SVC}/reservations/${err.response.data.reservationId}/cancel`); } catch(e){}
    }

    
    
    if (err.response && err.response.status === 409) {
      record.status = 'annulee';
      bookings.set(bookingId, record);
      return res.status(409).json({ error: 'Plus de places disponibles', booking: record });
    }
    if (err.response && err.response.status === 404) {
      record.status = 'annulee';
      bookings.set(bookingId, record);
      return res.status(404).json({ error: err.response.data.error || 'Introuvable', booking: record });
    }

    record.status = 'annulee';
    bookings.set(bookingId, record);
    return res.status(500).json({ error: err.message, booking: record });
  }
});

app.get('/bookings/:id', (req, res) => {
  const id = req.params.id;
  const b = bookings.get(id);
  if (!b) return res.status(404).json({ error: "Réservation introuvable" });
  res.json(b);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Service réservation démarré sur le port ${PORT}`));
