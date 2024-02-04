import { onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
// import { Value } from "sass";

export const UserContext = createContext()
export const UserContextProvider = ({children}) =>{
    const [currentUser, setCurrentUser] = useState({})
    const [userData, setUserData] = useState({});
    useEffect(()=>{
        const unsub = onAuthStateChanged(auth, (user)=>{
            setCurrentUser(user);
            if (user) {
                fetchData(user.uid);
              } else {
                setUserData({}); // Clear userData when no user is logged in
              }
            console.log(user)
        });
        return () => {
            unsub();
        }
    }, []);

    const fetchData = async (uid) => {
        try {
          const userDocRef = doc(db, "users", uid);
          const docSnap = await getDoc(userDocRef);
    
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserData(userData);
          } else {
            console.log('No such document!');
            setUserData({}); // Clear userData if document doesn't exist
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    
    return(
        <UserContext.Provider value={{ currentUser, userData }}>
            {children}
        </UserContext.Provider>
    )
};