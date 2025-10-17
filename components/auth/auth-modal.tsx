"use client";

import { Modal } from "@mantine/core";

import { LoginFormState } from "@/types/user";
import { useState } from "react";
import { AuthTabs } from "./auth-tabs";

export function AuthenticationModal({
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
        <Modal
            opened={opened}
            onClose={close}
            centered
            withCloseButton={!isFormPending}
            closeOnClickOutside={!isFormPending}
            title="Authentication"
            p={"xs"}
        >
            <AuthTabs
                loginFormState={loginFormState}
                setLoginFormState={setLoginFormState}
                signupFormState={signupFormState}
                setSignupFormState={setSignupFormState}
                closeModal={close}
            />
        </Modal>
    );
}
