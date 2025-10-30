// auth/context/centralized-auth-context.tsx
"use client";

import { useNetwork, UserNetworkReturnValue } from "@mantine/hooks";
import { createContext, ReactNode, useContext } from "react";
import { authClient } from "../auth-client";

type CentralizedAuthContextType = {
    sessionUser: ReturnType<typeof authClient.useSession>;
    network: UserNetworkReturnValue | null;
};

const CentralizedAuthContext = createContext<CentralizedAuthContextType>({
    sessionUser: authClient.useSession(),
    network: null,
});

export function CentralizedAuthContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const network = useNetwork();

    const sessionUser = authClient.useSession();

    const value: CentralizedAuthContextType = {
        sessionUser: sessionUser,
        network: network,
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
