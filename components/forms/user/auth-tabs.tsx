// For file /tabs/[activeTab].tsx
"use client";

import { AnonymousSignin } from "@/components/user/anonymous-signin";
import { authClient } from "@/lib/auth/auth-client";
import { MEMBER_ROLES } from "@/lib/constants";
import { LoginFormState } from "@/types/user";
import { Center, Divider, Loader, Stack, Tabs, Text } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";
import { OrganizationCreateForm } from "../organization/create-organization-form";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

type AuthTabsProps = {
    closeModal?: () => void;
    loginFormState: LoginFormState;
    setLoginFormState: Dispatch<SetStateAction<LoginFormState>>;

    signupFormState: LoginFormState;
    setSignupFormState: Dispatch<SetStateAction<LoginFormState>>;
};
export function AuthTabs({
    loginFormState,
    setLoginFormState,
    closeModal,
    signupFormState,
    setSignupFormState,
}: AuthTabsProps) {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <Center>
                <Loader loaders={{ dots: IconDots }} size={"xl"} />
            </Center>
        );
    }

    return (
        <Tabs defaultValue="default">
            <Tabs.List grow>
                {/** login to only to user that are not anon */}
                {!session?.user.isAnonymous && (
                    <Tabs.Tab value="first" color="orange">
                        Login
                    </Tabs.Tab>
                )}

                <Tabs.Tab value="second" color="green">
                    Sign Up
                </Tabs.Tab>

                {session?.user.role === MEMBER_ROLES.superAdmin && (
                    <Tabs.Tab value="second" color="green">
                        Create Organization
                    </Tabs.Tab>
                )}
            </Tabs.List>

            {/** login only to user that are not anon */}
            {!session?.user.isAnonymous && (
                <Tabs.Panel value="first" pt="xs">
                    <LoginForm
                        closeModal={closeModal}
                        redirectAfterSuccess={false}
                        formState={loginFormState}
                        setFormState={setLoginFormState}
                    />
                </Tabs.Panel>
            )}

            <Tabs.Panel value="second" pt="xs">
                <Stack gap={"xs"}>
                    <SignupForm
                        closeModal={closeModal}
                        redirectAfterSuccess={false}
                        formState={signupFormState}
                        setFormState={setSignupFormState}
                    />

                    {!session?.user.isAnonymous && (
                        <>
                            <Divider label="or" />
                            <AnonymousSignin mx={"auto"} />
                        </>
                    )}
                </Stack>
            </Tabs.Panel>

            {/** only show organization tabs to superadmin*/}
            {session?.user.role === MEMBER_ROLES.superAdmin && (
                <Tabs.Panel value="second" pt="xs">
                    <Stack gap={"xs"}>
                        <OrganizationCreateForm
                            closeModal={closeModal}
                            redirectAfterSuccess={false}
                            formState={signupFormState}
                            setFormState={setSignupFormState}
                        />
                    </Stack>
                </Tabs.Panel>
            )}

            <Tabs.Panel value="default" pt="xs">
                <Center>
                    <Text fw={700}>
                        This is the Authentication tab. Select a tab to start.
                    </Text>
                </Center>
            </Tabs.Panel>
        </Tabs>
    );
}
