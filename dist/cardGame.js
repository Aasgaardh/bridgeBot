"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardGame = void 0;
let playerNamesList = [];
class CardGame {
    constructor() {
        this.players = [];
        this.dealerIndex = Math.floor(Math.random() * 4);
        this.deck = [];
        this.bids = [];
        this.bidHierarchy = [
            '1 clubs', '1 diamonds', '1 hearts', '1 spades', '1 nt',
            '2 clubs', '2 diamonds', '2 hearts', '2 spades', '2 nt',
            '3 clubs', '3 diamonds', '3 hearts', '3 spades', '3 nt',
            '4 clubs', '4 diamonds', '4 hearts', '4 spades', '4 nt',
            '5 clubs', '5 diamonds', '5 hearts', '5 spades', '5 nt',
            '6 clubs', '6 diamonds', '6 hearts', '6 spades', '6 nt',
            '7 clubs', '7 diamonds', '7 hearts', '7 spades', '7 nt',
        ];
        this.currentBidIndex = -1;
        this.passCount = 0;
        this.lastBid = null;
        this.deck = this.createDeck();
        this.shuffleDeck();
        this.currentBidderIndex = this.dealerIndex;
    }
    createDeck() {
        const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        return suits.flatMap(suit => values.map(value => ({ value, suit })));
    }
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    dealCards() {
        this.shuffleDeck();
        this.players.forEach(player => player.hand = []);
        const handSize = Math.floor(this.deck.length / this.players.length);
        for (let i = 0; i < handSize; i++) {
            this.players.forEach(player => {
                const card = this.deck.pop();
                if (card) {
                    player.hand.push(card);
                }
            });
        }
        this.players.forEach(player => {
            player.hand = this.sortCards(player.hand);
        });
    }
    registerPlayers(names) {
        const orientations = ['North', 'East', 'South', 'West'];
        playerNamesList = names;
        this.players = names.map((name, index) => ({
            name,
            hand: [],
            orientation: orientations[index]
        }));
        this.dealCards();
    }
    sortCards(hand) {
        const valueOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const suitOrder = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
        return hand.sort((a, b) => {
            const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
            if (suitDiff !== 0)
                return suitDiff;
            return valueOrder.indexOf(a.value) - valueOrder.indexOf(b.value);
        });
    }
    makeBid(bid, by) {
        const playerIndex = this.players.findIndex(p => p.name === by);
        if (playerIndex !== this.currentBidderIndex) {
            return `It's ${playerNamesList[this.currentBidderIndex]}'s turn to bid.`;
        }
        if (bid === "pass") {
            if (this.currentBidIndex >= 0 && this.passCount === 2) {
                return `All bets are in. Let's play bridge`;
            }
            this.bids.push({ bid, by });
            this.passCount++;
            if (this.passCount >= 4) {
                this.shuffleDeck();
                this.dealCards();
                this.bids = [];
                this.passCount = 0;
                return "All players passed. Cards have been reshuffled and dealt again.";
            }
        }
        else {
            const bidIndex = this.bidHierarchy.indexOf(bid);
            if (bidIndex === -1) {
                return "Invalid bid format.";
            }
            if (bidIndex <= this.currentBidIndex) {
                return `Invalid bid by ${by}. Must be higher than ${this.bidHierarchy[this.currentBidIndex]}.`;
            }
            this.bids.push({ bid, by });
            this.currentBidIndex = bidIndex;
            this.passCount = 0;
        }
        this.advanceBidder();
        return `${by} bids ${bid}. It's ${playerNamesList[this.currentBidderIndex]}'s turn to bid`;
    }
    advanceBidder() {
        this.currentBidderIndex = (this.currentBidderIndex + 1) % this.players.length;
    }
    getCurrentBid() {
        return this.bids.length > 0 ? this.bids[this.bids.length - 1] : undefined;
    }
}
exports.CardGame = CardGame;
