import React, { useEffect, useState } from 'react';
import addResult from '../scripts/addResult.js';
import { OpenPopUp } from '../utils/popup.jsx';
import { getPlayerName } from '../utils/getPlayerName.js';
import EliminaScontro from './popup/EliminaScontro.jsx';

function ElencoScontriDaGiocare() {

    const [scontri, setScontri] = useState(() => JSON.parse(sessionStorage.getItem('scontri')) || []);
    const [giocatori, setGiocatori] = useState(() => JSON.parse(sessionStorage.getItem('players')) || []);

    // Effetto per gestire gli eventi di storage
    useEffect(() => {
        const handleStorageAddPlayers = () => {
            setScontri(JSON.parse(sessionStorage.getItem('scontri')));
            setGiocatori(JSON.parse(sessionStorage.getItem('players')));
        };

        window.addEventListener('StorageScontriUpdate', handleStorageAddPlayers);
        window.addEventListener('TabSwitch', handleStorageAddPlayers);

        return () => {
            window.removeEventListener('StorageScontriUpdate', handleStorageAddPlayers);
            window.removeEventListener('TabSwitch', handleStorageAddPlayers);
        };
    }, []);

    // Gestisce il click sul pulsante di vittoria
    const handleWin = (playerId) => (e) => {
        // Recupera l'id dello scontro
        const scontroId = e.target.closest('div').id;

        // Aggiunge il risultato dello scontro
        addResult(scontroId, playerId);
    }

    // Gestisce il click sul pulsante di eliminazione dello scontro
    const handleDeleteScontro = (scontroId) => (e) => {
        OpenPopUp(<EliminaScontro />, 300, null, [['Ok', true], ['Annulla', false]]).then((result) => {
            if (result) {
                // Rimovi lo scontro
                const scontri = JSON.parse(sessionStorage.getItem('scontri'));
                const newScontri = scontri.filter(scontro => scontro.id !== scontroId);
                sessionStorage.setItem('scontri', JSON.stringify(newScontri));
                setScontri(newScontri);
                window.dispatchEvent(new Event('StorageScontriUpdate'));
            }
        });
    }

    // Ritorna il JSX per il rendering del componente
    return (
        <div className='h-60 lg:h-full w-full relative'>
            <div className='h-full w-full overflow-y-auto absolute overflow-x-hidden flex flex-col gap-2'>
                {
                    scontri && scontri.filter(scontro => scontro.winnerId === null || scontro.winnerId === undefined).map((scontro, index) => {
                        return (
                            <div key={index} id={scontro.id} className='flex flex-row justify-between max-w-full bg-tertiary rounded-lg h-10 items-center p-2'>
                                <p className='mr-1 w-full text-center truncate'>{getPlayerName(scontro.player1Id, giocatori)}</p>
                                <button onClick={handleWin(scontro.player1Id)} className='w-40 text-center hover:bg-secondary rounded-lg'>🏆</button>
                                <p className='mr-2 font-bold w-40 text-center'>VS</p>
                                <p className='mr-1 w-full text-center truncate'>{getPlayerName(scontro.player2Id, giocatori)}</p>
                                <button onClick={handleWin(scontro.player2Id)} className='w-40 text-center hover:bg-secondary rounded-lg'>🏆</button>
                                <button onClick={handleDeleteScontro(scontro.id)} className='w-10 ml-3 text-center rounded-lg text-black fill-black hover:text-red-800 hover:fill-red-800 hover:bg-red-300 hover:border-red-300 focus:text-red-800 focus:fill-red-800 focus:bg-red-300 focus:border-red-300 active:border-red-300 active:text-red-800 active:fill-red-800 active:bg-red-300 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M292.31-140q-29.83 0-51.07-21.24Q220-182.48 220-212.31V-720h-10q-12.75 0-21.37-8.63-8.63-8.63-8.63-21.38 0-12.76 8.63-21.37Q197.25-780 210-780h150q0-14.69 10.35-25.04 10.34-10.34 25.03-10.34h169.24q14.69 0 25.03 10.34Q600-794.69 600-780h150q12.75 0 21.37 8.63 8.63 8.63 8.63 21.38 0 12.76-8.63 21.37Q762.75-720 750-720h-10v507.69q0 29.83-21.24 51.07Q697.52-140 667.69-140H292.31ZM680-720H280v507.69q0 5.39 3.46 8.85t8.85 3.46h375.38q5.39 0 8.85-3.46t3.46-8.85V-720ZM406.17-280q12.75 0 21.37-8.62 8.61-8.63 8.61-21.38v-300q0-12.75-8.63-21.38-8.62-8.62-21.38-8.62-12.75 0-21.37 8.62-8.61 8.63-8.61 21.38v300q0 12.75 8.62 21.38 8.63 8.62 21.39 8.62Zm147.69 0q12.75 0 21.37-8.62 8.61-8.63 8.61-21.38v-300q0-12.75-8.62-21.38-8.63-8.62-21.39-8.62-12.75 0-21.37 8.62-8.61 8.63-8.61 21.38v300q0 12.75 8.63 21.38 8.62 8.62 21.38 8.62ZM280-720v520-520Z"/></svg>
                                </button>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}

export default ElencoScontriDaGiocare;