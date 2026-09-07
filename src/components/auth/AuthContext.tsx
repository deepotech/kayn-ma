'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
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
    const lastSyncedUidRef = useRef<string | null>(null);
    const syncStateRef = useRef<{
        uid: string;
        promise: Promise<boolean>;
    } | null>(null);

    const syncSession = async (firebaseUser: User): Promise<boolean> => {
        // Reuse in-flight sync only if it belongs to the exact same UID
        if (syncStateRef.current && syncStateRef.current.uid === firebaseUser.uid) {
            return await syncStateRef.current.promise;
        }

        const runSync = async (): Promise<boolean> => {
            try {
                const idToken = await firebaseUser.getIdToken();
                const res = await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken }),
                });
                if (res.ok) {
                    lastSyncedUidRef.current = firebaseUser.uid;
                    return true;
                }
                console.error('[AuthContext] Session sync responded with status:', res.status);
                return false;
            } catch (error) {
                console.error('[AuthContext] Failed to sync session:', error);
                return false;
            } finally {
                if (syncStateRef.current?.uid === firebaseUser.uid) {
                    syncStateRef.current = null;
                }
            }
        };

        const syncPromise = runSync();
        syncStateRef.current = { uid: firebaseUser.uid, promise: syncPromise };
        return await syncPromise;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const synced = lastSyncedUidRef.current === firebaseUser.uid || (await syncSession(firebaseUser));
                if (synced) {
                    setUser(firebaseUser);
                } else {
                    console.warn('[AuthContext] Server session sync failed; clearing client auth state to prevent inconsistency');
                    setUser(null);
                    await firebaseSignOut(auth).catch(() => {});
                }
            } else {
                lastSyncedUidRef.current = null;
                syncStateRef.current = null;
                setUser(null);
                await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithEmail = async (email: string, password: string) => {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const synced = await syncSession(credential.user);
        if (!synced) {
            setUser(null);
            await firebaseSignOut(auth).catch(() => {});
            throw new Error('SESSION_SYNC_FAILED');
        }
        setUser(credential.user);
        return credential;
    };

    const signUpWithEmail = async (email: string, password: string) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const synced = await syncSession(credential.user);
        if (!synced) {
            setUser(null);
            await firebaseSignOut(auth).catch(() => {});
            throw new Error('SESSION_SYNC_FAILED');
        }
        setUser(credential.user);
        return credential;
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(auth, provider);
        const synced = await syncSession(credential.user);
        if (!synced) {
            setUser(null);
            await firebaseSignOut(auth).catch(() => {});
            throw new Error('SESSION_SYNC_FAILED');
        }
        setUser(credential.user);
        return credential;
    };

    const signOut = async () => {
        lastSyncedUidRef.current = null;
        syncStateRef.current = null;
        setUser(null);
        await firebaseSignOut(auth).catch(() => {});
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
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
