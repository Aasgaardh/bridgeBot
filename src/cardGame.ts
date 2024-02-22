// cardGame

let playerNamesList: string[] = []; // Liste med strings for å midlertidig lagre navnene til spillerne

export type Card = {
  value: string;
  suit: string;
};

export type Player = {
  name: string;
  hand: Card[];
  orientation: string; // Nord sør øst vest
};

export type Bid = {
  bid: string;
  by: string;
};

export class CardGame {
  players: Player[] = [];
  dealerIndex: number = Math.floor(Math.random() * 4); // Velger hvem som er dealer tilfeldig
  currentBidderIndex: number; // Sjekker indeksen på hvem som er dealer så programmet vet hvem som skal starte å by
  deck: Card[] = [];
  bids: Bid[] = []; // Lagrer bids fra spillerne
  bidHierarchy = [
    '1 clubs', '1 diamonds', '1 hearts', '1 spades', '1 nt',
    '2 clubs', '2 diamonds', '2 hearts', '2 spades', '2 nt',
    '3 clubs', '3 diamonds', '3 hearts', '3 spades', '3 nt',
    '4 clubs', '4 diamonds', '4 hearts', '4 spades', '4 nt',
    '5 clubs', '5 diamonds', '5 hearts', '5 spades', '5 nt',
    '6 clubs', '6 diamonds', '6 hearts', '6 spades', '6 nt',
    '7 clubs', '7 diamonds', '7 hearts', '7 spades', '7 nt',
  ];
  currentBidIndex: number = -1; // Sjekk så man ikke kan by utenfor begrensningene
  passCount: number = 0; // Teller hvor mange pass man ar på rad for å se om kort skal deles ut på nytt eller om spillet skal starte
  lastBid: Bid | null = null; // Satt til null ved start så antall pass blir riktig

  constructor() {
    this.deck = this.createDeck(); // Lager kortstokken
    this.shuffleDeck(); // Stokker kortene
    this.currentBidderIndex = this.dealerIndex; // Bud starter med dealeren
  }

  
  //Her lages kortstokken
  createDeck(): Card[] {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    return suits.flatMap(suit => values.map(value => ({ value, suit })));
  }

  // Her stokkes kortene tilfeldig
  shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // Deler ut kortene til spillerne
  dealCards(): void {
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
    // Sorterer spillernes kort
    this.players.forEach(player => {
      player.hand = this.sortCards(player.hand);
    });
  }

  // Registrerer de 4 spillerne med orienterning ['North', 'East', 'South', 'West']
  registerPlayers(names: string[]): void {
    const orientations = ['North', 'East', 'South', 'West'];
    playerNamesList = names;
    this.players = names.map((name, index) => ({
        name,
        hand: [],
        orientation: orientations[index]
    }));
    this.dealCards();
  }

  // Sorter kortene på spillerens hånd etter sort og verdi
  sortCards(hand: Card[]): Card[] {
    const valueOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suitOrder = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
    return hand.sort((a, b) => {
      const suitDiff = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
      if (suitDiff !== 0) return suitDiff;
      return valueOrder.indexOf(a.value) - valueOrder.indexOf(b.value);
    });
  }

  // Spillerne kan by etter tur innenfor de gitte kriterinene
  makeBid(bid: string, by: string): string {
    const playerIndex = this.players.findIndex(p => p.name === by);
    if (playerIndex !== this.currentBidderIndex) {
      return `It's ${playerNamesList[this.currentBidderIndex]}'s turn to bid.`;
    }

    if (bid === "pass") {
      if (this.currentBidIndex >= 0 && this.passCount === 2) {
        return `All bets are in. Let's play bridge`
      }
      this.bids.push({ bid, by });
      this.passCount++;
      if (this.passCount >= 4) {
        // Resetter spillet hvis alle spillerne sier pass uten noen bud
        this.shuffleDeck();
        this.dealCards();
        this.bids = [];
        this.passCount = 0;
        return "All players passed. Cards have been reshuffled and dealt again.";
      }
    } else {
      const bidIndex = this.bidHierarchy.indexOf(bid);
      if (bidIndex === -1) {
        return "Invalid bid format.";
      }
      if (bidIndex <= this.currentBidIndex) {
        return `Invalid bid by ${by}. Must be higher than ${this.bidHierarchy[this.currentBidIndex]}.`;
      }
      this.bids.push({ bid, by });
      this.currentBidIndex = bidIndex;
      this.passCount = 0; // Resetter passCounten hvis noen byr så det går en hel runde før spillet starter
    }

    // Hvem som har bydd hva og hvem som skal by neste 
    this.advanceBidder();
    return `${by} bids ${bid}. It's ${playerNamesList[this.currentBidderIndex]}'s turn to bid`;
  }

  // Sjekker hvem som er neste i køen til å by
  private advanceBidder() {
    this.currentBidderIndex = (this.currentBidderIndex + 1) % this.players.length;
  }

  // Sjekk bud
  getCurrentBid(): Bid | undefined {
    return this.bids.length > 0 ? this.bids[this.bids.length - 1] : undefined;
  }
}
