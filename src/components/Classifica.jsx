import React, { useState, useEffect } from 'react';
import { getPlayerName } from '../utils/getPlayerName.js';

function Classifica() {

    class PlayerCareer {
        constructor(name, id) {
            this.name = name;
            this.id = id;
            this.wins = 1;
        }
    }

    const [players, setPlayers] = useState(() => {
        const scontri = JSON.parse(sessionStorage.getItem('scontri')) || [];
        const giocatori = JSON.parse(sessionStorage.getItem('players')) || [];
        const playerMap = new Map();

        scontri.filter(scontro => scontro.winnerId !== null && scontro.winnerId !== undefined).forEach(scontro => {
            const winnerId = scontro.winnerId;
            const winnerName = getPlayerName(winnerId, giocatori);

            if (!playerMap.has(winnerId)) {
                playerMap.set(winnerId, new PlayerCareer(winnerName, winnerId));
            } else {
                playerMap.get(winnerId).wins++;
            }
        });

        const players = Array.from(playerMap.values());
        players.sort((a, b) => b.wins - a.wins);
        return players;
    });

    useEffect(() => {
        const handleStorageAddPlayers = () => {
            const scontri = JSON.parse(sessionStorage.getItem('scontri')) || [];
            const giocatori = JSON.parse(sessionStorage.getItem('players')) || [];
            const playerMap = new Map();

            scontri.filter(scontro => scontro.winnerId !== null && scontro.winnerId !== undefined).forEach(scontro => {
                const winnerId = scontro.winnerId;
                const winnerName = getPlayerName(winnerId, giocatori);

                if (!playerMap.has(winnerId)) {
                    playerMap.set(winnerId, new PlayerCareer(winnerName, winnerId));
                } else {
                    playerMap.get(winnerId).wins++;
                }
            });

            const players = Array.from(playerMap.values());
            players.sort((a, b) => b.wins - a.wins);
            setPlayers(players);
        };

        window.addEventListener('StorageScontriUpdate', handleStorageAddPlayers);
        window.addEventListener('StoragePlayerEdit', handleStorageAddPlayers);

        return () => {
            window.removeEventListener('StorageScontriUpdate', handleStorageAddPlayers);
            window.removeEventListener('StoragePlayerEdit', handleStorageAddPlayers);
        };
    }, []);

    const leaderboardColors = [ '!bg-yellow-300', '!bg-stone-500', '!bg-amber-800'];

    return (
        <div className='border-2 border-secondary rounded-lg p-5 h-52 lg:h-1/2'>
            <div className='h-full w-full relative'>
                <div className='h-full w-full overflow-y-auto absolute overflow-x-hidden flex flex-col gap-2'>
                    {
                        players.map((player, index) => {
                            return (
                                <div
                                    key={index}
                                    className='cursor-pointer flex flex-row justify-between w-full bg-tertiary rounded-lg h-10 items-center p-2'
                                    onMouseEnter={(e) => {
                                        const classes = (leaderboardColors[index] || '!bg-secondary').split(' ');
                                        classes.forEach(cls => e.currentTarget.classList.add(cls));
                                    }}
                                    onMouseLeave={(e) => {
                                        const classes = (leaderboardColors[index] || '!bg-secondary').split(' ');
                                        classes.forEach(cls => e.currentTarget.classList.remove(cls));
                                    }}
                                >
                                    <p className='text-left w-10/12 truncate'>{player.name}</p>
                                    <p className='text-center w-fit'>{player.wins} 🏆</p>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default Classifica;