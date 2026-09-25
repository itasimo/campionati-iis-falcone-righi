import React, { useState, useEffect } from 'react';

function AggiungiGiocatori() {
    const [option, setOption] = useState(''); // Stato per l'opzione selezionata
    const [players, setPlayers] = useState(() => JSON.parse(sessionStorage.getItem('players')) || []); // Stato per la lista dei giocatori

    // Classe per rappresentare un giocatore
    class Player {
        constructor(name, id) {
            this.name = String(name);
            this.id = id;
        }
    }

    // Sincronizza la lista dei giocatori con la sessionStorage
    useEffect(() => {
        const handleStorageEditPlayers = () => {
            setPlayers(JSON.parse(sessionStorage.getItem('players')));
        };

        window.addEventListener('StoragePlayerEdit', handleStorageEditPlayers);

        return () => {
            window.removeEventListener('StoragePlayerEdit', handleStorageEditPlayers);
        };
    }, []);

    // Gestisce il cambiamento dell'opzione selezionata
    const handleOptionChange = (e) => {
        setOption(e.target.value);
    };

    // Gestisce l'input numerico
    const handleNumInput = (e) => {
        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Enter') e.preventDefault();
    };



    // Gestisce il cambiamento del numero di giocatori
    const handleAddPlayerNum = (e) => {
        e.preventDefault();
        const num = Number(document.getElementById('PlayerNum').value); // Ottiene il numero di giocatori

        // Crea un array di numeri di giocatori che non sono già presenti
        const presentNums = [...players].map(player => player.name).filter(player => !isNaN(player));
        const allNums = Array.from({ length: num }, (_, i) => String(i + 1));
        const newPlayers = allNums.filter(num => !presentNums.includes(num));
        
        // Aggiunge nuovi giocatori
        addPlayers(newPlayers);
    };

    // Gestisce l'aggiunta di un nuovo giocatore con un nome
    const handleAddPlayerName = (e) => {
        e.preventDefault();

        // Ottiene il nome del giocatore
        const name = document.getElementById('PlayerName').value;

        // Aggiunge il giocatore
        addPlayers([name]);

        // Pulisce il campo di input
        document.getElementById('PlayerName').value = '';
    }


    // Aggiunge giocatori a sessionStorage
    const addPlayers = (playersArray) => {
        const newPlayers = [...players];

        // Crea un array di nuovi giocatori
        for (let i = 0; i < playersArray.length; i++) {
            newPlayers.push(new Player(playersArray[i], players.length + i));
        }
        
        // Aggiorna la lista dei giocatori localmente
        setPlayers(newPlayers);
        // Aggiorna la sessionStorage
        sessionStorage.setItem('players', JSON.stringify(newPlayers));
        // Notifica l'aggiunta di giocatori
        window.dispatchEvent(new Event('StorageAddPlayers'));
    }

    return (
        <div className='w-full flex flex-row'>
            <form className='flex flex-col gap-2 w-full'>
                <h1 className='w-fit font-bold'>
                    Aggiungi Giocatori
                </h1>
                <label>
                    Seleziona opzione:
                    <select value={option} onChange={handleOptionChange} className='ml-1'>
                        <option value="">--Seleziona--</option>
                        <option value="number">Giocatori come numero</option>
                        <option value="name">Giocatori come nome</option>
                    </select>
                </label>
                {option === 'number' && (
                    <label>
                        <div className='flex flex-row w-full justify-start gap-1'>
                            <p className='min-w-fit'>Numero di giocatori:</p>
                            <input type="text" inputMode="numeric" onKeyDown={handleNumInput} autoComplete="off" id='PlayerNum' className='ml-1 w-1/6 text-center appearance-none'/>
                            <button onClick={handleAddPlayerNum} className='ml-1 px-3 rounded-lg border-secondary border-2 hover:bg-secondary hover:text-white'>Aggiungi</button>
                        </div>
                    </label>
                )}
                {option === 'name' && (
                    <label>
                        <div className='flex flex-row w-full justify-start gap-1'>
                            <p className='min-w-fit'>Nome giocatore:</p>
                            <input type="text" id='PlayerName' className='ml-1 w-full' />
                            <button onClick={handleAddPlayerName} className='ml-1 px-3 rounded-lg border-secondary border-2 hover:bg-secondary hover:text-white'>Aggiungi</button>
                        </div>
                    </label>
                )}
            </form>
        </div>
    );
}
export default AggiungiGiocatori;