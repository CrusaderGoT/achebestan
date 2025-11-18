"use client";

import { authClient } from "@/lib/auth/auth-client";
import { UnstyledButton, UnstyledButtonProps } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export function AnonymousSignin({ ...props }: UnstyledButtonProps) {
    return (
        <UnstyledButton
            onClick={async () => {
                const user = await authClient.signIn.anonymous();

                if (!user.data) {
                    notifications.show({
                        message: "An Error Occured While Anonymous Sign In",
                    });
                } else {
                    notifications.show({
                        message: "Successfully Signed In Anonymously",
                    });
                }
            }}
            {...props}
        >
            Sign in Anonymously
        </UnstyledButton>
    );
}
