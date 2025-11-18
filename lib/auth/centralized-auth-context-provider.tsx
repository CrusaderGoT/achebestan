// auth/context/centralized-auth-context.tsx
"use client";

import { createContext, ReactNode, useContext } from "react";
import { authClient } from "./auth-client";

type CentralizedAuthContextType = {
    sessionUser: ReturnType<typeof authClient.useSession>;

    currentOrganization: ReturnType<typeof authClient.useActiveOrganization>;
};

const CentralizedAuthContext = createContext<CentralizedAuthContextType>({
    sessionUser: {
        data: null,
        isPending: true,
        error: null,
        refetch: () => null,
    },
    currentOrganization: {
        data: null,
        isPending: true,
        isRefetching: false,
        error: null,
        refetch: () => null,
    },
});

export function CentralizedAuthContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const sessionUser = authClient.useSession();

    const currentOrganization = authClient.useActiveOrganization();

    const value: CentralizedAuthContextType = {
        sessionUser: sessionUser,
        currentOrganization: currentOrganization,
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
