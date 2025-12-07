"use client";

import { Drawer } from "@mantine/core";

import { LoginFormState } from "@/types/user";
import { useState } from "react";
import { AuthTabs } from "./auth-tabs";

export function AuthenticationDrawer({
    opened,
    close,
}: {
    opened: boolean;
    close: () => void;
}) {
    const [loginFormState, setLoginFormState] =
        useState<LoginFormState>("idle");

    const [signupFormState, setSignupFormState] =
        useState<LoginFormState>("idle");

    const isFormPending =
        signupFormState === "pending" || loginFormState === "pending";

    return (
        <Drawer
            opened={opened}
            onClose={close}
            position="top"
            offset={70}
            withCloseButton={!isFormPending}
            closeOnClickOutside={!isFormPending}
            title="Authentication"
            size={"100%"}
            overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
            withinPortal={false}
        >
            <AuthTabs
                loginFormState={loginFormState}
                setLoginFormState={setLoginFormState}
                signupFormState={signupFormState}
                setSignupFormState={setSignupFormState}
                closeDrawer={close}
            />
        </Drawer>
    );
}
