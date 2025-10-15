"use client";

import { authClient } from "@/lib/auth/auth-client";
import { ActionIcon } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLogout } from "@tabler/icons-react";

export function LogoutButton() {
    return (
        <ActionIcon
            onClick={async () => {
                const { data, error } = await authClient.signOut();

                if (data?.success) {
                    notifications.show({
                        message: "Logged Out",
                    });
                } else {
                    notifications.show({
                        message: `Error While Logging Out -> ${
                            error?.message || "Logout Error"
                        }`,
                    });
                }
            }}
            color="red"
            size={"lg"}
            variant="subtle"
        >
            <IconLogout />
        </ActionIcon>
    );
}
