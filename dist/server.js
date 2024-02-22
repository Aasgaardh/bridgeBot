"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cardGame_1 = require("./cardGame");
const app = (0, express_1.default)();
const port = 8000;
const game = new cardGame_1.CardGame();
app.use(express_1.default.json());
app.post('/register', (req, res) => {
    const { names } = req.body;
    if (!names || names.length !== 4) {
        return res.status(400).send('Exactly 4 player names are required.');
    }
    game.registerPlayers(names);
    const orientations = ['North', 'East', 'South', 'West'];
    const playerInfo = names.map((name, index) => `${name} (${orientations[index]})`).join(', ');
    res.send(`${playerInfo} registered and cards dealt. ${names[game.currentBidderIndex]} is the dealer and starts the bidding`);
});
app.get('/players', (req, res) => {
    if (game.players.length === 0) {
        return res.status(404).send('No players have been registered yet');
    }
    const playerInfo = game.players.map(player => `${player.name} (${player.orientation})`);
    res.json({ players: playerInfo });
});
app.post('/bid', (req, res) => {
    const { name, bid } = req.body;
    const bidResponse = game.makeBid(bid, name);
    res.send(bidResponse);
});
app.get('/currentBid', (req, res) => {
    const currentBid = game.getCurrentBid();
    if (!currentBid) {
        res.status(404).send('No bids have been made yet');
    }
    else {
        res.json(currentBid);
    }
});
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
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
