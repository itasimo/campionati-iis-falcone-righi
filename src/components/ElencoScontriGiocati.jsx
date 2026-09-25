import React, {useEffect, useState} from "react";
import modifyResult from "../scripts/modifyResult";
import { getPlayerName } from "../utils/getPlayerName.js";

function ElencoScontriGiocati() {

    const [scontri, setScontri] = useState(() => JSON.parse(sessionStorage.getItem('scontri')) || []);
    const [giocatori, setGiocatori] = useState(() => JSON.parse(sessionStorage.getItem('players')) || []);

    useEffect(() => {
        const handleStorageAddPlayers = () => {
            setScontri(JSON.parse(sessionStorage.getItem('scontri')));
            setGiocatori(JSON.parse(sessionStorage.getItem('players')));
        };

        // Event listener necessario per aggiornare la lista degli scontri dopo aver modificato il risultato di uno scontro
        window.addEventListener('StorageScontriUpdate', handleStorageAddPlayers);
        window.addEventListener('TabSwitch', handleStorageAddPlayers);

        return () => {
            window.removeEventListener('StorageScontriUpdate', handleStorageAddPlayers);
            window.removeEventListener('TabSwitch', handleStorageAddPlayers);
        };
    }, []);

    const handleSwitchWin = (e) => {
        const scontroId = e.target.closest('div').id;
        modifyResult(scontroId);
    }

    return (
        <div className='h-60 lg:h-full w-full relative'>
            <div className='h-full w-full overflow-y-auto absolute flex flex-col gap-2'>
                {
                    scontri && scontri.filter(scontro => scontro.winnerId !== null && scontro.winnerId !== undefined).map((scontro, index) => {
                        return (
                            <div key={index} id={scontro.id} className='flex flex-row justify-start gap-2 w-full bg-tertiary rounded-lg h-10 items-center p-2'>
                                <p className='text-center min-w-fit w-11/12'>{getPlayerName(scontro.player1Id, giocatori)} {scontro.winnerId === scontro.player1Id ? '🏆' : '' }</p>
                                <p className='font-bold w-fit text-center'>VS</p>
                                <p className='text-center w-full truncate'>{getPlayerName(scontro.player2Id, giocatori)} {scontro.winnerId === scontro.player2Id ? '🏆' : '' }</p>
                                <button onClick={handleSwitchWin} className="w-1/2 flex flex-row justify-end fill-black">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" className="hover:bg-secondary hover:fill-black rounded-lg">
                                        <path d="M280-120 80-320l200-200 57 56-104 104h607v80H233l104 104-57 56Zm400-320-57-56 104-104H120v-80h607L623-784l57-56 200 200-200 200Z"/>
                                    </svg>
                                </button>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}

export default ElencoScontriGiocati;