"use client";

import {
  browserLocalPersistence,
  onIdTokenChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getFirebaseAuth } from "@/config/firebase";
import { getAuthenticationErrorMessage } from "@/features/auth/auth-errors";
import { loadAdminSession } from "@/features/auth/auth-service";
import {
  AdminAccessDeniedError,
  InvalidAuthResponseError,
  type AuthenticatedUser,
} from "@/features/auth/auth-user";
import { ApiError } from "@/services/api-error";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  sessionError: string | null;
  signIn: (email: string, password: string) => Promise<AuthenticatedUser>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  retrySession: () => Promise<void>;
  clearSessionError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mustCloseFirebaseSession(error: unknown): boolean {
  return (
    error instanceof AdminAccessDeniedError ||
    error instanceof InvalidAuthResponseError ||
    (error instanceof ApiError && (error.status === 401 || error.status === 403))
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const activeSessionRequest = useRef<{
    firebaseUid: string;
    promise: Promise<AuthenticatedUser>;
  } | null>(null);

  const synchronizeSession = useCallback(
    (firebaseUser: FirebaseUser): Promise<AuthenticatedUser> => {
      if (activeSessionRequest.current?.firebaseUid === firebaseUser.uid) {
        return activeSessionRequest.current.promise;
      }

      setStatus("loading");
      setSessionError(null);

      const promise = loadAdminSession(firebaseUser.uid)
        .then((authenticatedUser) => {
          setUser(authenticatedUser);
          setStatus("authenticated");
          return authenticatedUser;
        })
        .catch(async (error: unknown) => {
          setUser(null);

          if (mustCloseFirebaseSession(error)) {
            const auth = getFirebaseAuth();

            if (auth.currentUser) {
              await firebaseSignOut(auth);
            }

            setStatus("unauthenticated");
          } else {
            setStatus("error");
          }

          setSessionError(getAuthenticationErrorMessage(error));
          throw error;
        })
        .finally(() => {
          if (activeSessionRequest.current?.promise === promise) {
            activeSessionRequest.current = null;
          }
        });

      activeSessionRequest.current = {
        firebaseUid: firebaseUser.uid,
        promise,
      };

      return promise;
    },
    [],
  );

  useEffect(() => {
    let isActive = true;
    let auth: Auth;

    try {
      auth = getFirebaseAuth();
    } catch (error) {
      queueMicrotask(() => {
        if (isActive) {
          setStatus("error");
          setSessionError(getAuthenticationErrorMessage(error));
        }
      });

      return () => {
        isActive = false;
      };
    }

    const unsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      void synchronizeSession(firebaseUser).catch(() => undefined);
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [synchronizeSession]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthenticatedUser> => {
      let firebaseAuthenticated = false;
      setStatus("loading");
      setSessionError(null);

      try {
        const auth = getFirebaseAuth();
        await setPersistence(auth, browserLocalPersistence);
        const credential = await signInWithEmailAndPassword(auth, email, password);
        firebaseAuthenticated = true;

        return await synchronizeSession(credential.user);
      } catch (error) {
        if (!firebaseAuthenticated) {
          setStatus("unauthenticated");
          setSessionError(getAuthenticationErrorMessage(error));
        }

        throw error;
      }
    },
    [synchronizeSession],
  );

  const sendPasswordReset = useCallback(async (email: string): Promise<void> => {
    await firebaseSendPasswordResetEmail(getFirebaseAuth(), email);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setSessionError(null);

    try {
      await firebaseSignOut(getFirebaseAuth());
      setUser(null);
      setStatus("unauthenticated");
    } catch (error) {
      setStatus("error");
      setSessionError(getAuthenticationErrorMessage(error));
      throw error;
    }
  }, []);

  const retrySession = useCallback(async (): Promise<void> => {
    const firebaseUser = getFirebaseAuth().currentUser;

    if (!firebaseUser) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    await synchronizeSession(firebaseUser);
  }, [synchronizeSession]);

  const clearSessionError = useCallback(() => setSessionError(null), []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        sessionError,
        signIn,
        sendPasswordReset,
        signOut,
        retrySession,
        clearSessionError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
