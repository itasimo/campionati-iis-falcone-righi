import { useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import sha256 from "../utils/sha256";

function Save() {

    const [saveTimer, setSaveTimer] = useState(() => {
        const settings = JSON.parse(sessionStorage.getItem("settings"));
        return settings?.saveTimer || JSON.parse(localStorage.getItem('defSettings')).saveTimer;
    });

    useEffect(() => {
        const interval = setInterval(() => {
            saveNow();
        }, saveTimer);
        return () => clearInterval(interval);
    }, [saveTimer]);

    useEffect(() => {
        const updateSaveTimer = () => {
            setSaveTimer(JSON.parse(sessionStorage.getItem("settings")).saveTimer);
            saveNow();
        };

        window.addEventListener("SettingsUpdate", updateSaveTimer);

        return () => {
            window.removeEventListener("SettingsUpdate", updateSaveTimer);
        };
    }, []);

    return null;
}

const saveNow = () => {
    const SessionStorage = JSON.stringify(sessionStorage);
    const PreviousSessionStorage = localStorage.getItem('PreviousHash');

    const hash = sha256(JSON.stringify(SessionStorage));

    console.log(hash, PreviousSessionStorage);
    

    if (hash !== PreviousSessionStorage) {
        localStorage.setItem('PreviousHash', hash);
        saveData(SessionStorage);
    }
}

const saveData = async (data) => {
    // Get the user's UID
    const user = auth.currentUser;
    const uid = user.uid;

    // Get the class ID
    const classeId = JSON.parse(localStorage.getItem('classe')).id;
    
    // Write the data to the database under the user's Classi subcollection
    const userClassRef = doc(db, "Users", uid, "Classi", classeId);
    setDoc(userClassRef, JSON.parse(data), { merge: true })
        .catch((error) => {
            console.error("Error writing data in user's collection: ", error);
        });
 
}

export {Save, saveNow};