import React, { useEffect, useState } from 'react';
import ModificaGiocatore from '../scripts/ModificaGiocatori';
import { OpenPopUp } from '../utils/popup';
import EliminaTuttiPopUp from './popup/EliminaTutti';


function ElencoGiocatori() {

    const [players, setPlayers] = useState(() => JSON.parse(sessionStorage.getItem('players')) || []);

    // Sincronizza la lista dei giocatori con la sessionStorage
    useEffect(() => {
        const handleStorageAddPlayers = () => {
            // Aggiorna la lista dei giocatori
            setPlayers(JSON.parse(sessionStorage.getItem('players')));
        };

        window.addEventListener('StorageAddPlayers', handleStorageAddPlayers);
        window.addEventListener('StoragePlayerEdit', handleStorageAddPlayers);

        return () => {
            window.removeEventListener('StorageAddPlayers', handleStorageAddPlayers);
            window.removeEventListener('StoragePlayerEdit', handleStorageAddPlayers);
        };
    }, []);

    
    const handlePlayerEdit = (action) => (e) => {
        if (action === 'delete_all') {

            const openPopUp = () => {
                OpenPopUp(<EliminaTuttiPopUp />, 300, null, [['Ok', true], ['Annulla', false]]).then((result) => {
                    if (result) {
                        ModificaGiocatore(null, 'delete_all');
                    }
                });
            };
            openPopUp();

        } else if (action === 'delete') {

            const nameCard = e.target.closest('[data-id]');
            const id = Number(nameCard.getAttribute('data-id'));
            ModificaGiocatore(id, 'delete');

        } else if (action === 'name') {
            if (e.key === 'Enter' || e.type === 'blur') {
                const input = e.target;
                input.disabled = true;
                const id = Number(input.parentElement.getAttribute('data-id'));
                ModificaGiocatore(id, 'edit', input.value);
            }
        }
    }

    const handleNameEditBtn = (e) => {
        const input = e.target.closest('button').parentElement.parentElement.querySelector('input');
        input.disabled = false;
        input.focus();
    };

    return (
        <div className='flex flex-col lg:h-full h-52 w-full'>
            <div className='flex flex-row justify-between items-center'>
                <h1 className='w-fit font-bold'>
                    Elenco:
                </h1>
                <button onClick={handlePlayerEdit('delete_all')} className='flex flex-row rounded-md items-center justify-between py-2 px-4 text-center text-sm transition-all text-secondary fill-secondary hover:text-red-800 hover:fill-red-800 hover:bg-red-300 hover:border-red-300 focus:text-red-800 focus:fill-red-800 focus:bg-red-300 focus:border-red-300 active:border-red-300 active:text-red-800 active:fill-red-800 active:bg-red-300 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M292.31-140q-29.83 0-51.07-21.24Q220-182.48 220-212.31V-720h-10q-12.75 0-21.37-8.63-8.63-8.63-8.63-21.38 0-12.76 8.63-21.37Q197.25-780 210-780h150q0-14.69 10.35-25.04 10.34-10.34 25.03-10.34h169.24q14.69 0 25.03 10.34Q600-794.69 600-780h150q12.75 0 21.37 8.63 8.63 8.63 8.63 21.38 0 12.76-8.63 21.37Q762.75-720 750-720h-10v507.69q0 29.83-21.24 51.07Q697.52-140 667.69-140H292.31ZM680-720H280v507.69q0 5.39 3.46 8.85t8.85 3.46h375.38q5.39 0 8.85-3.46t3.46-8.85V-720ZM406.17-280q12.75 0 21.37-8.62 8.61-8.63 8.61-21.38v-300q0-12.75-8.63-21.38-8.62-8.62-21.38-8.62-12.75 0-21.37 8.62-8.61 8.63-8.61 21.38v300q0 12.75 8.62 21.38 8.63 8.62 21.39 8.62Zm147.69 0q12.75 0 21.37-8.62 8.61-8.63 8.61-21.38v-300q0-12.75-8.62-21.38-8.63-8.62-21.39-8.62-12.75 0-21.37 8.62-8.61 8.63-8.61 21.38v300q0 12.75 8.63 21.38 8.62 8.62 21.38 8.62ZM280-720v520-520Z"/></svg>
                    <p>Elimina tutti</p>
                </button>
            </div>
            <div className='h-full min-h-40 w-full relative'>
                <div className='h-full w-full overflow-y-auto absolute'>
                    {
                        players && players.map((player, index) => {
                            return (
                                <div key={index} data-id={player.id} className='flex flex-row w-full rounded-md items-center justify-between py-2 px-4 text-center text-sm transition-all text-secondary fill-secondary hover:text-white hover:fill-white hover:bg-secondary hover:border-secondary focus:text-white focus:fill-white focus:bg-secondary focus:border-secondary active:border-secondary active:text-white active:fill-white active:bg-secondary disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'>
                                    <input type="text" value={player.name} onChange={(e) => {
                                        const newPlayers = [...players];
                                        newPlayers[index].name = e.target.value;
                                        setPlayers(newPlayers);
                                    }} onKeyUp={handlePlayerEdit('name')} onBlur={handlePlayerEdit('name')} disabled className='border-transparent bg-transparent outline-none w-full'/>
                                    <div className='flex flex-row'>
                                        <button onClick={handleNameEditBtn} className='hover:bg-white hover:bg-opacity-55 rounded-lg flex justify-center items-center'>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M200-200h50.46l409.46-409.46-50.46-50.46L200-250.46V-200Zm-23.84 60q-15.37 0-25.76-10.4-10.4-10.39-10.4-25.76v-69.3q0-14.63 5.62-27.89 5.61-13.26 15.46-23.11l506.54-506.31q9.07-8.24 20.03-12.73 10.97-4.5 23-4.5t23.3 4.27q11.28 4.27 19.97 13.58l48.85 49.46q9.31 8.69 13.27 20 3.96 11.31 3.96 22.62 0 12.07-4.12 23.03-4.12 10.97-13.11 20.04L296.46-161.08q-9.85 9.85-23.11 15.46-13.26 5.62-27.89 5.62h-69.3Zm584.22-570.15-50.23-50.23 50.23 50.23Zm-126.13 75.9-24.79-25.67 50.46 50.46-25.67-24.79Z"/></svg>
                                        </button>
                                        <button onClick={handlePlayerEdit('delete')} className='hover:bg-white hover:bg-opacity-55 rounded-lg flex justify-center items-center'>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M292.31-140q-29.83 0-51.07-21.24Q220-182.48 220-212.31V-720h-10q-12.75 0-21.37-8.63-8.63-8.63-8.63-21.38 0-12.76 8.63-21.37Q197.25-780 210-780h150q0-14.69 10.35-25.04 10.34-10.34 25.03-10.34h169.24q14.69 0 25.03 10.34Q600-794.69 600-780h150q12.75 0 21.37 8.63 8.63 8.63 8.63 21.38 0 12.76-8.63 21.37Q762.75-720 750-720h-10v507.69q0 29.83-21.24 51.07Q697.52-140 667.69-140H292.31ZM680-720H280v507.69q0 5.39 3.46 8.85t8.85 3.46h375.38q5.39 0 8.85-3.46t3.46-8.85V-720ZM406.17-280q12.75 0 21.37-8.62 8.61-8.63 8.61-21.38v-300q0-12.75-8.63-21.38-8.62-8.62-21.38-8.62-12.75 0-21.37 8.62-8.61 8.63-8.61 21.38v300q0 12.75 8.62 21.38 8.63 8.62 21.39 8.62Zm147.69 0q12.75 0 21.37-8.62 8.61-8.63 8.61-21.38v-300q0-12.75-8.62-21.38-8.63-8.62-21.39-8.62-12.75 0-21.37 8.62-8.61 8.63-8.61 21.38v300q0 12.75 8.63 21.38 8.62 8.62 21.38 8.62ZM280-720v520-520Z"/></svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );

}

export default ElencoGiocatori;