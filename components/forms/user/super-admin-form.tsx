

import { authClient } from "@/lib/auth-client";
import { validatePasscode } from "@/lib/utils/user/validate-passcode";
import { Button, PinInput, Stack } from "@mantine/core";
import { createFormContext } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

type SuperAdminFormType = {
    passcode: string;
};

export const [
    SuperUserFormProvider,
    useSuperUserFormContext,
    useSuperUserForm,
] = createFormContext<SuperAdminFormType>();

export function SuperAdminForm({
    session,
}: {
    session: ReturnType<typeof authClient.useSession>["data"];
}) {
    const form = useSuperUserForm({
        mode: "uncontrolled",
        validate: {
            passcode(value) {
                return !value || value.length !== 5 ? "Enter Passcode" : null;
            },
        },
    });

    const router = useRouter();

    async function handleSubmit(formData: SuperAdminFormType) {
        if (!session?.user) {
            notifications.show({
                message: `Login First!`,
            });
            return;
        }

        // validate formData Passcode
        const valid = await validatePasscode(formData.passcode);

        if (!valid) {
            notifications.show({
                message: `An Error Occured`,
            });
            return;
        }

        const { data, error } = await authClient.admin.setRole({
            userId: session.user.id,
            role: "superAdmin",
        });

        if (error) {
            notifications.show({
                message: `An Error Occured -> ${error.message || ""}`,
            });
            return;
        }

        notifications.show({
            message: `Successfully Made ${data.user.name.toUpperCase()} A Super Admin`,
        });
        router.refresh();
    }

    return (
        <SuperUserFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <PinInput
                        key={form.key("passcode")}
                        {...form.getInputProps("passcode")}
                        length={5}
                        placeholder="☠"
                        inputType="tel"
                        inputMode="numeric"
                        mx={"auto"}
                        mt={"sm"}
                        disabled={form.submitting}
                    />

                    <Button type="submit" loading={form.submitting} color="red">
                        Create Super Admin
                    </Button>
                </Stack>
            </form>
        </SuperUserFormProvider>
    );
}
