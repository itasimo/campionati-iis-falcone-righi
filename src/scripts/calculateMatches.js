function calculateMatches(giocatori) {

    class Match {
        constructor(player1, player2) {
            this.player1Id = player1.id;
            this.player2Id = player2.id;
            this.id = player1.id + "|" + player2.id;
            this.winnerId = null;
        }
    }

    let matches = new Map();
    for (let i = 0; i < giocatori.length; i++) {
        for (let j = i + 1; j < giocatori.length; j++) {
            // Only direct matches: 1 vs 2 but not 2 vs 1
            let match = new Match(giocatori[i], giocatori[j]);
            matches.set(match.id, match);
        }
    }

    // Convert matches to array
    matches = Array.from(matches.values());

    return matches;
}

export default calculateMatches;
