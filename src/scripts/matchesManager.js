import { useEffect } from "react";
import calculateMatches from "./calculateMatches";

function matchesManager() {

    // Sincronizza la lista dei giocatori con la sessionStorage
    useEffect(() => {
        const handleStorageAddPlayers = () => {

            // Recupera la lista dei giocatori dalla sessionStorage
            const giocatori = JSON.parse(sessionStorage.getItem('players')) || [];

            if (giocatori.length > 0) {
                // Recupera la lista dei giocatori dalla sessionStorage
                const currentScontri = JSON.parse(sessionStorage.getItem('scontri')) || [];

                // Calcola i nuovi scontri (only IDs, no player objects)
                const calculatedMatches = calculateMatches(giocatori);

                // Aggiorna gli scontri esistenti mantenendo i risultati (winnerId)
                let updatedMatches = calculatedMatches.map(calculatedMatch => {
                    // Cerca lo scontro corrente nella lista degli scontri esistenti
                    const existingMatch = currentScontri.find(s => s.id == calculatedMatch.id);
                    // Se lo scontro esiste, mantiene il winnerId altrimenti lo imposta a null
                    return existingMatch ? { ...calculatedMatch, winnerId: existingMatch.winnerId || null } : calculatedMatch;
                });

                // Rimuovi gli scontri eliminati dall'utente
                // Usa gli ID degli scontri per trovare gli scontri eliminati
                const currentScontriIds = new Set(currentScontri.map(s => s.id));
                const updatedMatchIds = new Set(updatedMatches.map(s => s.id));

                // Trova gli scontri che erano nell'elenco originale ma non ci sono più
                const deletedMatchIds = [...currentScontriIds].filter(id => !updatedMatchIds.has(id));
                // Tieni solo gli scontri non eliminati
                updatedMatches = updatedMatches.filter(s => !deletedMatchIds.includes(s.id));

                // Merge: add back played matches that weren't in the calculated list
                const playedMatches = currentScontri.filter(s => s.winnerId !== null && s.winnerId !== undefined);
                const playedMatchesToAdd = playedMatches.filter(s => !updatedMatchIds.has(s.id));
                updatedMatches = [...updatedMatches, ...playedMatchesToAdd];

                // Aggiorna la lista degli scontri nella sessionStorage e lancia l'evento di aggiornamento
                sessionStorage.setItem('scontri', JSON.stringify(updatedMatches));
                window.dispatchEvent(new Event('StorageScontriUpdate'));
            }
        };

        window.addEventListener('StorageAddPlayers', handleStorageAddPlayers);
        window.addEventListener('StoragePlayerEdit', handleStorageAddPlayers);

        return () => {
            window.removeEventListener('StorageAddPlayers', handleStorageAddPlayers);
            window.removeEventListener('StoragePlayerEdit', handleStorageAddPlayers);
        };
    }, []);

    return null; // Or return some JSX if needed
}

export default matchesManager;
