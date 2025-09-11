"use client";

import { Modal } from "@mantine/core";

import { LoginFormState } from "@/lib/types/login";
import { useState } from "react";
import { LoginForm } from "./login-form";

export function LoginModal({
    opened,
    close,
}: {
    opened: boolean;
    close: () => void;
}) {
    const [formState, setFormState] = useState<LoginFormState>("idle");

    return (
        <Modal
            opened={opened}
            onClose={close}
            centered
            withCloseButton={formState !== "pending"}
            closeOnClickOutside={formState !== "pending"}
        >
            <LoginForm
                closeModal={close}
                redirectAfterSuccess={false}
                formState={formState}
                setFormState={setFormState}
            />
        </Modal>
    );
}
