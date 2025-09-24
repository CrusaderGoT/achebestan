// For file /tabs/[activeTab].tsx
"use client";

import { AnonymousSignin } from "@/components/user/anonymous-signin";
import { authClient } from "@/lib/auth-client";
import { LoginFormState } from "@/lib/types/login";
import { Center, Divider, Stack, Tabs, Text } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
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
    const { data: session } = authClient.useSession();

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
