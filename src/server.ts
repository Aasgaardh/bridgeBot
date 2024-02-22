// server.ts

// Importerer express of cardGame
import express from 'express';
import { CardGame } from './cardGame';

const app = express();
const port = 8000;
const game = new CardGame();

app.use(express.json());

// post registrer for registrering av spillere
app.post('/register', (req, res) => {
  const { names } = req.body as { names: string[] };
  if (!names || names.length !== 4) {
    return res.status(400).send('Exactly 4 player names are required.');
  }
  game.registerPlayers(names);
  const orientations = ['North', 'East', 'South', 'West']; // Legger til orientering så man vet hvilket lag man er på
  const playerInfo = names.map((name, index) => `${name} (${orientations[index]})`).join(', ');
  res.send(`${playerInfo} registered and cards dealt. ${names[game.currentBidderIndex]} is the dealer and starts the bidding`);
});

// Se alle registrerte spillere
app.get('/players', (req, res) => {
  if (game.players.length === 0) {
    return res.status(404).send('No players have been registered yet');
  }
  const playerInfo = game.players.map(player => `${player.name} (${player.orientation})`);
  res.json({ players: playerInfo });
});

// Post bid for å kunne by
app.post('/bid', (req, res) => {
  const { name, bid } = req.body;
  const bidResponse = game.makeBid(bid, name);
  res.send(bidResponse);
});

// Get currentBid for å se hva det høyeste budet så langt er
app.get('/currentBid', (req, res) => {
  const currentBid = game.getCurrentBid();
  if (!currentBid) {
    res.status(404).send('No bids have been made yet');
  } else {
    res.json(currentBid);
  }
});

// Get hands for å se spillerne og hvilke kort de har
app.get('/hands', (req, res) => {
  if (game.players.length === 0) {
    return res.status(404).send('No players have been registered yet');
  }
  const hands = game.players.map(player => ({
    name: player.name,
    hand: player.hand.map(card => `${card.value} of ${card.suit}`)
  }));
  res.json(hands);
});

// Kjører på porten ${port}
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
