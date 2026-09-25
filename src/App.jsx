import { useEffect, useState } from 'react';
import { auth } from './config/firebaseConfig';

import Login from './components/Login';
import ClasseLoader from './components/ClasseLoader';
import AggiungiGiocatori from './components/AggiungiGiocatori';
import ElencoGiocatori from './components/ElencoGiocatori';
import ElencoScontriDaGiocare from './components/ElencoScontriDaGiocare';
import ElencoScontriGiocati from './components/ElencoScontriGiocati';
import Grafico from './components/Grafico';
import Classifica from './components/Classifica';
import Settings from './components/Settings';

import ScontriManager from './scripts/matchesManager';
import { Save } from './scripts/Save';



const clearSessionStorageOnReload = () => {
    window.addEventListener('beforeunload', () => {
        sessionStorage.clear();
        localStorage.setItem('defSettings', JSON.stringify({ returnMatches: false, saveTimer: 30000 }));
    });
};

clearSessionStorageOnReload();

function App() {

    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [option, setOption] = useState('Add');
    const [classeSelected, setClasseSelected] = useState(false);
    const [currentClasse, setCurrentClasse] = useState(null);

    localStorage.setItem('defSettings', JSON.stringify({ returnMatches: false, saveTimer: 30000 }));

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                setUserLoggedIn(true);
            } else {
                setUserLoggedIn(false);
            }
        });

        window.addEventListener('ClasseSelected', () => {
            const classe = localStorage.getItem('classe');
            setCurrentClasse(JSON.parse(classe));
            setClasseSelected(true);
        });
    }, []);

    
    const handleOptionChange = (e) => {
        setOption(e.target.dataset.action);
    }

    useEffect(() => {
        const options = document.getElementById('resultOptions');
        if (options) {
            const addResultElem = options.children[0];
            const resultsElem = options.children[1];

            if (option === 'Add') {
                addResultElem.style.textDecoration = 'underline';
                resultsElem.style.textDecoration = 'none';
            } else {
                addResultElem.style.textDecoration = 'none';
                resultsElem.style.textDecoration = 'underline';
            }

            window.dispatchEvent(new Event('TabSwitch'));
        }
    }, [option]);

    useEffect(() => {
        window.dispatchEvent(new Event('StorageAddPlayers'));
        window.dispatchEvent(new Event('TabSwitch'))
        window.dispatchEvent(new Event('StorageScontriUpdate'));
    }, [currentClasse]);

    return (
        <div className='w-svw h-full lg:h-svh'>
            <div className={`bg-primary w-svw ${classeSelected && userLoggedIn ? 'h-full' : 'h-svh'} box-border flex flex-col gap-2 p-2`}>
                {userLoggedIn ? 
                    classeSelected ?
                        <>
                            <Save />
                            <div className='flex flex-col h-fit box-border border-secondary border-2 rounded-lg p-2'>
                                <h1 className='text-center text-2xl font-bold text-secondary truncate'>
                                    {currentClasse.name}
                                </h1>
                            </div>
                            <div className='flex flex-row w-full h-full gap-2 flex-wrap lg:flex-nowrap'>
                                <div className='flex flex-col gap-2 lg:w-1/3 w-full box-border border-secondary border-2 rounded-lg p-5 h-auto'>
                                    <AggiungiGiocatori />
                                    <ElencoGiocatori />
                                </div>
                                <div className='flex flex-col w-full lg:w-1/3 box-border h-full border-secondary border-2 rounded-lg p-5 gap-2'>
                                    <div id='resultOptions' className='flex flex-row justify-center gap-5'>
                                        <h1 onClick={handleOptionChange} data-action="Add" style={{textDecoration: "underline"}} className='font-bold cursor-pointer'>
                                            Aggiungi Risultato
                                        </h1>
                                        <h1 onClick={handleOptionChange} data-action="View" className='font-bold cursor-pointer'>
                                            Risultati
                                        </h1>
                                    </div>
                                    <ScontriManager />
                                    {
                                        option === 'Add' ? 
                                        <ElencoScontriDaGiocare /> : 
                                        <ElencoScontriGiocati />
                                    }
                                </div>
                                <div className='flex flex-col w-full lg:w-1/3 gap-2'>
                                    <Grafico />
                                    <Classifica />
                                    <Settings />
                                </div>
                            </div>
                        </> 

                        : 

                        <div className="inset-0 flex justify-center p-5">
                            <ClasseLoader side="bottom" />
                        </div>
                    :

                    <Login />
                }
            </div>
        </div>
    );
}

export default App;