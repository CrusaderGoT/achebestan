"use client";

import { Modal } from "@mantine/core";

import { LoginForm } from "./login-form";

export function LoginModal({
    opened,
    close,
}: {
    opened: boolean;
    close: () => void;
}) {
    return (
        <Modal opened={opened} onClose={close} centered withCloseButton={false}>
            <LoginForm closeModal={close} redirectAfterSuccess={false} />
        </Modal>
    );
}
