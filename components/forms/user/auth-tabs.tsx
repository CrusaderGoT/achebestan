// For file /tabs/[activeTab].tsx
"use client";

import { LoginFormState } from "@/lib/types/login";
import { Center, Tabs, Text } from "@mantine/core";
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
    return (
        <Tabs defaultValue="default">
            <Tabs.List grow>
                <Tabs.Tab value="first" color="orange">
                    Login
                </Tabs.Tab>

                <Tabs.Tab value="second" color="green">
                    Sign Up
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="first" pt="xs">
                <LoginForm
                    closeModal={closeModal}
                    redirectAfterSuccess={false}
                    formState={loginFormState}
                    setFormState={setLoginFormState}
                />
            </Tabs.Panel>

            <Tabs.Panel value="second" pt="xs">
                <SignupForm
                    closeModal={closeModal}
                    redirectAfterSuccess={false}
                    formState={signupFormState}
                    setFormState={setSignupFormState}
                />
            </Tabs.Panel>

            <Tabs.Panel value="default" pt="xs">
                <Center>
                    <Text>
                        This is the Authentication tab. Select a tab to start.
                    </Text>
                </Center>
            </Tabs.Panel>
        </Tabs>
    );
}
