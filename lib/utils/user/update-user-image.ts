import { authClient } from "@/lib/auth-client";
import { notifications } from "@mantine/notifications";

export const updateUserImage = async (url: string) => {
    const { data } = await authClient.updateUser({
        image: url,
    });

    if (!data?.status) {
        notifications.show({
            title: "User Image Update Failed",
            message: "Failed to update user I=image",
            color: "red",
        });
        return;
    }
};
