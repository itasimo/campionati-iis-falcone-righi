import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { useState, useEffect } from "react";
import { auth } from '../config/firebaseConfig';
import { OpenPopUp } from "../utils/popup";
import AggiungiClasse from "./popup/AggiungiClasse";

function ClasseLoader({ side }) {

    const [uid, setUid] = useState(null);
    const [classList, setClassList] = useState([]);
    const [verse, setVerse] = useState(side);

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in.
                const uid = user.uid;
                setUid(uid);
                getAllClassiIds(uid).then((ids) => setClassList(ids));
                
            } else {
                // No user is signed in.
                setUid(null);
                setClassList([]);
            }
        });
    }, []);   
    
    useEffect(() => {
        setVerse(side);
    }, [side]);

    
    const getAllClassiIds = async(uid) => {
        try {
            // Reference to the user's main document
            const userRef = doc(db, "Users", uid);

            // Fetch the document
            const userDoc = await getDoc(userRef);

            // Check if the document exists
            if (userDoc.exists()) {
            // Retrieve the AllClassi field
            const data = userDoc.data();
            const allClassi = data.AllClassi;

            // Return the IDs if they exist
            if (allClassi && allClassi.ids) {
                return allClassi.ids
            } else {
                console.error("No class IDs found.");
                return [];
            }
            } else {
            console.error("User document does not exist.");
            return [];
            }
        } catch (error) {
            console.error("Error fetching AllClassi IDs:", error);
            return [];
        }
    }


    const toogleOpening = (e) => {
        // Toggle the dropdown
        const dropdown = document.getElementById(e.target.dataset.dropdownToggle);
        dropdown.classList.toggle('hidden');

        try {
            dropdown.style.top = verse == "top" ? getTop(e.target) - getHeight(dropdown) + 'px' : 'auto';
        } catch (error) {
            // Closed dropdown from another component
        }
        

        // Rotate the arrow
        const arrow = document.querySelector('#dropdownClasseSelect svg');
        arrow.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    }

    const getTop = function(el) {
        
        // Save the scroll position
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // Set the scroll position to 0
        window.scrollTo(0, 0);

        // Get the top position
        const rect = el.getBoundingClientRect();
        const top = rect.top;

        // Reset the scroll position
        window.scrollTo(scrollLeft, scrollTop);

        return top;
    }

    const getHeight = function(el) {
        const elClone = el.cloneNode(true);
        elClone.style.position = 'absolute';
        elClone.style.visibility = 'hidden';
        elClone.style.display = 'block';
        document.body.appendChild(elClone);
        const height = elClone.offsetHeight;
        document.body.removeChild(elClone);
        return height;
    }

    const handleCreateClasse = () => {
        OpenPopUp(<AggiungiClasse />, null, null, [['Annulla', false], ['Ok', true]]).then((result) => {
            if (result) {
                // Create the new class
                const name = localStorage.getItem('classe');
                const id = classList.length > 0 ? Math.max(...classList.map((classe) => parseInt(classe.id))) + 1 : 1;
                const classe = { name, id };
                
                // Overrite the class in the local storage to include the ID
                localStorage.setItem('classe', JSON.stringify(classe));

                // Update the state
                setClassList([...classList, classe]);

                // Write the new class IDs to the database
                const userRef = doc(db, "Users", uid);
                setDoc(
                    userRef,
                    {
                        AllClassi: { ids: [...classList, classe] },
                    },
                    { merge: true }
                );

                // Create a new document in the user's class collection
                const userClassRef = doc(db, `Users/${uid}/Classi`, classe.id.toString());
                setDoc(userClassRef, {})
                    .catch((error) => {
                        console.error("Error writing class document in user's collection: ", error);
                    });
                }
        });
    }

    const handleClasseSelect = (e) => {
        const name = e.target.textContent;
        const id = e.target.closest('li').id;
        const classe = { name, id };

        localStorage.setItem('classe', JSON.stringify(classe));

        // Get the file matching the class ID
        const userClassRef = doc(db, `Users/${uid}/Classi`, id);
        getDoc(userClassRef)
            .then((doc) => {
                if (doc.exists()) {
                    // Set the class data in the session storage
                    // For each field in the document, set the session storage item
                    if (doc.data().players) {
                        Object.entries(doc.data()).forEach(([key, value]) => {
                            // Handle scontri migration: convert old format (with winner objects) to new format (with winnerId)
                            if (key === 'scontri' && Array.isArray(value)) {
                                const migratedScontri = value.map(scontro => {
                                    // If scontro has old format with winner object, migrate to winnerId
                                    if (scontro.winner && typeof scontro.winner === 'object' && scontro.winner.id) {
                                        const { winner, player1, player2, ...rest } = scontro;
                                        return {
                                            ...rest,
                                            winnerId: winner.id,
                                            player1Id: player1?.id || scontro.player1Id,
                                            player2Id: player2?.id || scontro.player2Id,
                                        };
                                    }
                                    // Already in new format
                                    return scontro;
                                });
                                sessionStorage.setItem(key, JSON.stringify(migratedScontri));
                            } else if (typeof value === 'object') {
                                // Stringify objects and arrays
                                sessionStorage.setItem(key, JSON.stringify(value));
                            } else if (typeof value === 'string') {
                                // Handle strings that might already be stringified
                                try {
                                    // Try to parse - if it works, it's already stringified JSON
                                    JSON.parse(value);
                                    sessionStorage.setItem(key, value);
                                } catch {
                                    // Not JSON, store as is
                                    sessionStorage.setItem(key, value);
                                }
                            } else {
                                sessionStorage.setItem(key, value);
                            }
                        });
                    } else {
                        sessionStorage.clear();
                        sessionStorage.setItem('settings', doc.data().settings || localStorage.getItem('defSettings'));
                    }

                    toogleOpening({ target: { dataset: { dropdownToggle: 'dropdown' } } });

                    window.dispatchEvent(new Event('ClasseSelected'));
                } else {
                    console.error("No such document!");
                }
            })
            .catch((error) => {
                console.error("Error getting class document:", error);
            });
    }

    return (
        <>
            <div>
                <button onClick={toogleOpening} id="dropdownClasseSelect" data-dropdown-toggle="dropdown" className="text-white bg-secondary focus:ring-4 focus:outline-none focus:ring-tertiary font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center" type="button">
                    Seleziona la classe
                    <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"> <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/></svg>
                </button>
                <div id="dropdown" className="z-10 absolute bg-secondary divide-y divide-gray-100 rounded-lg shadow w-44 hidden">
                    <ul className="py-2 text-sm text-white" aria-labelledby="dropdownClasseSelect">
                        <li>
                            <a onClick={handleCreateClasse} className="flex items-center gap-1 px-4 py-2 cursor-pointer hover:bg-tertiary fill-white">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
                                Aggiungi classe
                            </a>
                        </li>
                        {uid && classList.map((classe, i) => (
                            <li key={i} onClick={handleClasseSelect} id={classe.id}>
                                <a className="flex items-center gap-1 px-4 py-2 cursor-pointer hover:bg-tertiary fill-white truncate">
                                    {classe.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    )
}
export default ClasseLoader;