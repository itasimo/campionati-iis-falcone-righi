/**
 * Aggiorna il risultato di uno scontro specificato impostando il vincitore.
 *
 * @param {number} id - L'ID dello scontro da aggiornare.
 * @param {number} playerId - L'ID del giocatore vincitore.
 */
function addResult(id, playerId) {
    // Recupera la lista degli scontri dalla sessionStorage
    const scontri = JSON.parse(sessionStorage.getItem('scontri'));

    // Trova lo scontro con l'id specificato
    const scontro = scontri.find(scontro => scontro.id === id);

    // Imposta il vincitore dello scontro usando l'ID
    scontro.winnerId = playerId;

    // Aggiorna la lista degli scontri nella sessionStorage
    sessionStorage.setItem('scontri', JSON.stringify(scontri));
    window.dispatchEvent(new Event('StorageScontriUpdate'));
}

export default addResult;
