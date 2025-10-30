// auth/context/centralized-auth-context.tsx
"use client";

import { createContext, ReactNode, useContext } from "react";
import { authClient } from "../auth-client";

type CentralizedAuthContextType = {
    sessionUser: ReturnType<typeof authClient.useSession>;
};

const CentralizedAuthContext = createContext<CentralizedAuthContextType>({
    sessionUser: authClient.useSession(),
});

export function CentralizedAuthContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const sessionUser = authClient.useSession();

    const value: CentralizedAuthContextType = {
        sessionUser: sessionUser,
    };

    return (
        <CentralizedAuthContext.Provider value={value}>
            {children}
        </CentralizedAuthContext.Provider>
    );
}

export function useCentralizedAuth() {
    return useContext(CentralizedAuthContext);
}
