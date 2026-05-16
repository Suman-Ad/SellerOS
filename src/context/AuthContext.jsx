import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth, db } from "@/firebase/config";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({
  children,
}) {

  const [user, setUser] =
    useState(null);

  const [userData, setUserData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (currentUser) => {

          try {

            if (currentUser) {

              setUser(currentUser);

              const userRef = doc(
                db,
                "users",
                currentUser.uid
              );

              const userSnap =
                await getDoc(userRef);

              if (userSnap.exists()) {

                setUserData(
                  userSnap.data()
                );
              }

            } else {

              setUser(null);

              setUserData(null);
            }

          } catch (error) {

            console.error(
              "AUTH CONTEXT ERROR:",
              error
            );

          } finally {

            setLoading(false);
          }
        }
      );

    return () => unsubscribe();

  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}