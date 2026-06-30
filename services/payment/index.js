const express = require('express');
const app = express();
app.use(express.json());

//Pour accepter les paiements dont le montant <= 1000
app.post('/payments', (req, res) => {
  const { amount, card } = req.body;
  if (typeof amount !== 'number') return res.status(400).json({ error: "Montant invalide" });
  // simulation de validation de carte
  if (card && card.number && card.number === '0000-0000-0000-0000') {
    return res.json({ status: 'refuse', reason: 'carte_invalide' });
  }
  if (amount > 1000) return res.json({ status: 'refuse', reason: 'montant_depassé' });
  res.json({ status: 'accepte' });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Service paiement démarré sur le port ${PORT}`));
