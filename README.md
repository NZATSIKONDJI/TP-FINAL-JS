# TP Reservation - Démo microservices (version française)

Ce dépôt contient quatre microservices simples démontrant le flux de réservation :

- Service d'identité (port 3001)
- Service inventaire (port 3002)
- Service paiement (port 3003)
- Service de réservation / orchestrateur (port 3000)

Démarrage rapide (dans des terminaux séparés) :

```bash
cd services/identity
npm install
npm start

cd ../inventory
npm install
npm start

cd ../payment
npm install
npm start

cd ../booking
npm install
npm start
```

Exemple de réservation :

```bash
curl -X POST http://localhost:3000/bookings \
	-H 'Content-Type: application/json' \
	-d '{"userId":1,"eventId":1,"amount":50,"card":{"number":"4111-1111-1111-1111"}}'
```

Statuts de réservation possibles : `en_attente`, `confirmee`, `paiement_echoue`, `annulee`.
