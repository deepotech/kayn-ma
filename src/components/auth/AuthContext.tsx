'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<any>;
    signUpWithEmail: (email: string, password: string) => Promise<any>;
    signInWithGoogle: () => Promise<any>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Determine if we need to refresh the session cookie
                try {
                    const idToken = await firebaseUser.getIdToken();
                    await fetch('/api/auth/session', { // Updated endpoint
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idToken }),
                    });
                    // Only set user after session sync is attempted
                    setUser(firebaseUser);
                } catch (error) {
                    console.error('Failed to sync session:', error);
                    // Still set user to allow client-side to function, even if server sync failed (though strict pages will block)
                    setUser(firebaseUser);
                }
            } else {
                setUser(null);
                // Ensure session is cleared
                await fetch('/api/auth/logout', { method: 'POST' });
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        return await signInWithEmailAndPassword(auth, email, password);
        // The observer will handle the cookie sync
    };

    const signUpWithEmail = async (email: string, password: string) => {
        return await createUserWithEmailAndPassword(auth, email, password);
        // The observer will handle the cookie sync
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
        // The observer will handle the cookie sync
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        await fetch('/api/auth/logout', { method: 'POST' });
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signInWithEmail,
            signUpWithEmail,
            signInWithGoogle,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
