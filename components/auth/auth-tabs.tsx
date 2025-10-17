// For file /tabs/[activeTab].tsx
"use client";

import { AnonymousSignin } from "@/components/auth/anonymous-signin";
import { authClient } from "@/lib/auth-client";
import { ORG_ROLES } from "@/lib/constants";
import { LoginFormState } from "@/types/user";
import { Center, Divider, Loader, Stack, Tabs, Text } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import { Dispatch, SetStateAction } from "react";
import { OrganizationCreateForm } from "../forms/organization/create-organization-form";
import { LoginForm } from "../forms/user/login-form";
import { SignupForm } from "../forms/user/signup-form";
import { SuperAdminForm } from "../forms/user/super-admin-form";

type AuthTabsProps = {
    closeModal?: () => void;
    loginFormState: LoginFormState;
    setLoginFormState: Dispatch<SetStateAction<LoginFormState>>;

    signupFormState: LoginFormState;
    setSignupFormState: Dispatch<SetStateAction<LoginFormState>>;
};

const AUTH_TABS = {
    default: "default",
    login: "first",
    signup: "second",
    organization: "third",
    superadmin: "fourth",
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
        <Tabs defaultValue={AUTH_TABS.default}>
            <Tabs.List grow>
                {!session && (
                    <>
                        {/** login to only to user that are not anon */}
                        <Tabs.Tab value={AUTH_TABS.login} color="orange">
                            Login
                        </Tabs.Tab>

                        <Tabs.Tab value={AUTH_TABS.signup} color="green">
                            Sign Up
                        </Tabs.Tab>
                    </>
                )}

                {session && (
                    <>
                        <Tabs.Tab value={AUTH_TABS.organization} color="white">
                            Create Organization
                        </Tabs.Tab>

                        {!session.user.role?.includes(ORG_ROLES.superAdmin) && (
                            <Tabs.Tab value={AUTH_TABS.superadmin} color="red">
                                Create Super Admin
                            </Tabs.Tab>
                        )}
                    </>
                )}
            </Tabs.List>

            {!session && (
                <>
                    <Tabs.Panel value={AUTH_TABS.login} pt="xs">
                        <LoginForm
                            closeModal={closeModal}
                            redirectAfterSuccess={false}
                            formState={loginFormState}
                            setFormState={setLoginFormState}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value={AUTH_TABS.signup} pt="xs">
                        <Stack gap={"xs"}>
                            <SignupForm
                                closeModal={closeModal}
                                redirectAfterSuccess={false}
                                formState={signupFormState}
                                setFormState={setSignupFormState}
                            />

                            <Divider label="or" />
                            <AnonymousSignin mx={"auto"} />
                        </Stack>
                    </Tabs.Panel>
                </>
            )}

            {session && (
                <>
                    {/** only show organization tabs to superadmin*/}
                    <Tabs.Panel value={AUTH_TABS.organization} pt="xs">
                        <Stack gap={"xs"}>
                            <OrganizationCreateForm
                                closeModal={closeModal}
                                redirectAfterSuccess={false}
                                formState={signupFormState}
                                setFormState={setSignupFormState}
                            />
                        </Stack>
                    </Tabs.Panel>

                    {!session.user.role?.includes(ORG_ROLES.superAdmin) && (
                        <Tabs.Panel value={AUTH_TABS.superadmin}>
                            <SuperAdminForm session={session} />
                        </Tabs.Panel>
                    )}
                </>
            )}

            <Tabs.Panel value={AUTH_TABS.default} pt="xs">
                <Center>
                    <Text fw={700}>
                        This is the Authentication tab. Select a tab to start.
                    </Text>
                </Center>
            </Tabs.Panel>
        </Tabs>
    );
}
