import React, { useEffect, useState } from 'react';
import { auth, db } from "../config/firebaseConfig";
import { doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import CalcolaScontri from '../scripts/calculateMatches';
import ClasseLoader from './ClasseLoader';
import { saveNow } from '../scripts/Save';
import { OpenPopUp } from '../utils/popup';
import EliminaClassePopUp from './popup/EliminaClasse';

function Settings() {

    const [settings, setSettings] = useState(() => JSON.parse(sessionStorage.getItem('settings')) || JSON.parse(localStorage.getItem('defSettings')));

    useEffect(() => {
        const updateSettings = () => {
            setSettings(JSON.parse(sessionStorage.getItem('settings')));
            document.getElementById('saveTimer').value = JSON.parse(sessionStorage.getItem('settings')).saveTimer * 0.001;
        }

        window.addEventListener('ClasseSelected', updateSettings);

        return () => {
            window.removeEventListener('ClasseSelected', updateSettings);
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('settings', JSON.stringify(settings));

        // returnMatches changed -> Recalculate scontri
        const players = JSON.parse(sessionStorage.getItem('players'));
        if (players) {
            CalcolaScontri(players);
        }
        window.dispatchEvent(new Event('StorageAddPlayers'));
        window.dispatchEvent(new Event('SettingsUpdate'));

    }, [settings]);

    const handleChangeReturnMatches = () => {
        setSettings({ ...settings, returnMatches: !settings.returnMatches });
    }

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            
            // Clear sessionStorage
            sessionStorage.clear();
            window.location.reload();
        }).catch((error) => {
            // An error happened.
            console.error('Error signing out: ', error);
        });
    }

    const handleDeleteClasse = () => {

        OpenPopUp(<EliminaClassePopUp />, 300, null, [['Ok', true], ['Annulla', false]]).then((result) => {
            if (result) {

                // Ottieni l'utente corrente
                const user = auth.currentUser;
                const uid = user.uid;
                const classe = JSON.parse(localStorage.getItem('classe'));

                // Ottieni il documento dell'utente
                const userRef = doc(db, "Users", uid);
                
                getDoc(userRef)
                    .then((doc) => {
                        if (doc.exists()) {
                            // Rimuovi l'ID della classe dal documento dell'utente
                            const classList = doc.data().AllClassi.ids;
                            const updatedClassList = classList.filter(cl => cl.id !== Number(classe.id));
                            
                            updateDoc(userRef, {
                                AllClassi: { ids: updatedClassList }
                            })
                                .catch((error) => {
                                    console.error("Errore nella rimozione dell'ID della classe dal documento dell'utente: ", error);
                                });
                        } else {
                            console.error("Nessun documento trovato!");
                        }
                    }).then(() => {
                        // Elimina il documento della classe
                        deleteDoc(doc(db, `Users/${uid}/Classi`, classe.id.toString()))
                            .then(() => {
                                // Pulisci localStorage e sessionStorage e ricarica la pagina
                                localStorage.clear();
                                sessionStorage.clear();
                                window.location.reload();
                            })
                            .catch((error) => {
                                console.error("Errore nell'eliminazione del documento della classe dal documento dell'utente: ", error);
                            }
                        );
                    })
                    .catch((error) => {
                        console.error("Errore nel recupero del documento dell'utente:", error);
                    });
            }
        });
    }

    const handleBackup = () => {
        const classe = JSON.parse(localStorage.getItem('classe'));
        const players = JSON.parse(sessionStorage.getItem('players')) || [];
        const scontri = JSON.parse(sessionStorage.getItem('scontri')) || [];
        const settings = JSON.parse(sessionStorage.getItem('settings')) || {};

        const backupData = {
            players,
            scontri,
            settings,
            classe,
            backupDate: new Date().toISOString()
        };

        // Format timestamp as YYYY-MM-DD_HH-MM-SS
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
        const fileName = `backup-campionato-${timestamp}-${classe.name}.json`;

        // Create blob and download
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const handleDeleteSaveNow = () => {
        saveNow();
    }


    return (
        <div className="border-2 border-secondary rounded-lg p-5 h-1/2">
            <h1 className="font-bold mb-2">Impostazioni</h1>
            <div className="ml-5 flex flex-col gap-2">
                <div className='flex flex-row gap-1'>
                    <p>Salvataggio automatico ogni </p>
                    <input 
                        id='saveTimer'
                        type="number" 
                        defaultValue={Number(settings.saveTimer) * 0.001} 
                        className='w-10' 
                        onChange={(e) => setSettings({ ...settings, saveTimer: e.target.value * 1000 })}
                    />
                    <p>secondi</p>
                </div>
                <div className='flex flex-row gap-2'>
                    <button onClick={handleDeleteSaveNow} className='flex flex-row gap-2 rounded-md items-center justify-between py-2 px-4 text-center text-sm transition-all text-secondary fill-secondary hover:text-primary hover:fill-primary hover:bg-secondary hover:border-secondary focus:text-primary focus:fill-primary focus:bg-secondary focus:border-secondary active:border-secondary active:text-primary active:fill-primary active:bg-secondary disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>
                        <p>Salva</p>
                    </button>
                    <button onClick={handleBackup} className='flex flex-row gap-2 rounded-md items-center justify-between py-2 px-4 text-center text-sm transition-all text-secondary fill-secondary hover:text-primary hover:fill-primary hover:bg-secondary hover:border-secondary focus:text-primary focus:fill-primary focus:bg-secondary focus:border-secondary active:border-secondary active:text-primary active:fill-primary active:bg-secondary disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320ZM200-120v-80h80v-40q0-33 23.5-56.5T360-320h40v-80q0-50 35-85t85-35q50 0 85 35t35 85v80h40q33 0 56.5 23.5T760-240v40h80v80H200Zm160-200v-80h400v80H360Z"/></svg>
                        <p>Backup</p>
                    </button>
                </div>
                <div className='flex flex-row gap-5'>
                    <ClasseLoader side="top" />
                    <button onClick={handleDeleteClasse} className='flex flex-row rounded-md items-center justify-between py-2 px-4 text-center text-sm transition-all text-secondary fill-secondary hover:text-red-800 hover:fill-red-800 hover:bg-red-300 hover:border-red-300 focus:text-red-800 focus:fill-red-800 focus:bg-red-300 focus:border-red-300 active:border-red-300 active:text-red-800 active:fill-red-800 active:bg-red-300 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M292.31-140q-29.83 0-51.07-21.24Q220-182.48 220-212.31V-720h-10q-12.75 0-21.37-8.63-8.63-8.63-8.63-21.38 0-12.76 8.63-21.37Q197.25-780 210-780h150q0-14.69 10.35-25.04 10.34-10.34 25.03-10.34h169.24q14.69 0 25.03 10.34Q600-794.69 600-780h150q12.75 0 21.37 8.63 8.63 8.63 8.63 21.38 0 12.76-8.63 21.37Q762.75-720 750-720h-10v507.69q0 29.83-21.24 51.07Q697.52-140 667.69-140H292.31ZM680-720H280v507.69q0 5.39 3.46 8.85t8.85 3.46h375.38q5.39 0 8.85-3.46t3.46-8.85V-720ZM406.17-280q12.75 0 21.37-8.62 8.61-8.63 8.61-21.38v-300q0-12.75-8.63-21.38-8.62-8.62-21.38-8.62-12.75 0-21.37 8.62-8.61 8.63-8.61 21.38v300q0 12.75 8.62 21.38 8.63 8.62 21.39 8.62Zm147.69 0q12.75 0 21.37-8.62 8.61-8.63 8.61-21.38v-300q0-12.75-8.62-21.38-8.63-8.62-21.39-8.62-12.75 0-21.37 8.62-8.61 8.63-8.61 21.38v300q0 12.75 8.63 21.38 8.62 8.62 21.38 8.62ZM280-720v520-520Z"/></svg>
                        <p>Elimina classe</p>
                    </button>
                </div>
                <div>
                    <button onClick={handleSignOut} className='flex flex-row gap-2 rounded-md items-center justify-between py-2 px-4 text-center text-sm transition-all text-secondary fill-secondary hover:text-red-800 hover:fill-red-800 hover:bg-red-300 hover:border-red-300 focus:text-red-800 focus:fill-red-800 focus:bg-red-300 focus:border-red-300 active:border-red-300 active:text-red-800 active:fill-red-800 active:bg-red-300 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none'>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>
                        <p>Esci</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;