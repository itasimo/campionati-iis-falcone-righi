import addResult from './addResult.js';

function modifyResult(scontroId) {

    const scontri = JSON.parse(sessionStorage.getItem('scontri'));
    const scontro = scontri.find(scontro => scontro.id === scontroId);

    // Trova l'ID del giocatore perdente ricavandolo dall'ID dello scontro
    // L'ID dello scontro è "player1Id|player2Id"
    const loserPlayerId = scontro.winnerId === scontro.player1Id ? scontro.player2Id : scontro.player1Id;

    addResult(scontroId, loserPlayerId);

}

export default modifyResult;
