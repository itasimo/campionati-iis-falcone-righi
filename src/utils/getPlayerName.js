/**
 * Looks up a player's name by their ID from the giocatori array
 * @param {number} playerId - The player ID to look up
 * @param {Array} giocatori - The array of players
 * @returns {string} The player's name or 'Unknown' if not found
 */
export function getPlayerName(playerId, giocatori) {
    return giocatori.find(g => g.id === playerId)?.name || 'Unknown';
}
