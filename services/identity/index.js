const express = require('express');
const app = express();
app.use(express.json());

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];

app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  res.json(user);
});

app.get('/users/exists/:id', (req, res) => {
  const id = Number(req.params.id);
  const exists = users.some(u => u.id === id);
  res.json({ existe: exists });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Service d'identité démarré sur le port ${PORT}`));
