// For file /tabs/[activeTab].tsx
"use client";

import { AnonymousSignin } from "@/components/auth/anonymous-signin";
import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { useSitePermissions } from "@/lib/hooks/auth/site-permissions";
import publicStyles from "@/styles/public.module.css";
import { LoginFormState } from "@/types/user";
import {
    Center,
    Divider,
    Group,
    Loader,
    Mark,
    ScrollArea,
    Stack,
    Tabs,
    Text,
} from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { OrganizationCreateForm } from "../forms/organization/create-organization-form";
import { LoginForm } from "../forms/user/login-form";
import { SignupForm } from "../forms/user/signup-form";
import { SuperAdminForm } from "../forms/user/super-admin-form";
import { ListOrganizations } from "../organization/list-organizations";
import { MembersTable } from "../organization/manage-members";
import { LogoutButton } from "./logout-btn";

type AuthTabsProps = {
    closeDrawer?: () => void;
    loginFormState: LoginFormState;
    setLoginFormState: Dispatch<SetStateAction<LoginFormState>>;

    signupFormState: LoginFormState;
    setSignupFormState: Dispatch<SetStateAction<LoginFormState>>;
};

export const AUTH_TABS = {
    default: "default",
    login: "first",
    signup: "second",
    organization: "third",
    superadmin: "fourth",
    listOrganizations: "fifth",
    manageMembers: "sixth",
};

export function AuthTabs({
    loginFormState,
    setLoginFormState,
    closeDrawer: closeModal,
    signupFormState,
    setSignupFormState,
}: AuthTabsProps) {
    const { sessionUser, currentOrganization } = useCentralizedAuth();

    const { data: permissions } = useSitePermissions({
        currentOrganizationId: currentOrganization.data?.id,
        userId: sessionUser.data?.user.id,
    });

    if (sessionUser.isPending || currentOrganization.isPending) {
        return (
            <Center my={"auto"}>
                <Loader size={"lg"} />
            </Center>
        );
    }

    return (
        <Tabs defaultValue={AUTH_TABS.default}>
            <Tabs.List grow>
                {!sessionUser.data && (
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

                {sessionUser.data && (
                    <>
                        {permissions?.canCreateOrganization && (
                            <Tabs.Tab
                                value={AUTH_TABS.organization}
                                color="white"
                            >
                                Create Organization
                            </Tabs.Tab>
                        )}

                        {permissions?.canCreateSuperAdmin && (
                            <Tabs.Tab value={AUTH_TABS.superadmin} color="red">
                                Create Super Admin
                            </Tabs.Tab>
                        )}

                        <Tabs.Tab
                            value={AUTH_TABS.listOrganizations}
                            color="blue"
                        >
                            Select Organization
                        </Tabs.Tab>

                        <Tabs.Tab value={AUTH_TABS.manageMembers} color="blue">
                            Manage Memeber
                        </Tabs.Tab>
                    </>
                )}
            </Tabs.List>

            <ScrollArea p={"sm"}>
                {!sessionUser.data && (
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

                {sessionUser.data && (
                    <>
                        {/** only show create organization tabs to superadmin*/}
                        {permissions?.canCreateOrganization && (
                            <Tabs.Panel value={AUTH_TABS.organization} pt="xs">
                                <OrganizationCreateForm
                                    closeModal={closeModal}
                                    redirectAfterSuccess={false}
                                    formState={signupFormState}
                                    setFormState={setSignupFormState}
                                />
                            </Tabs.Panel>
                        )}

                        {permissions?.canCreateSuperAdmin && (
                            <Tabs.Panel value={AUTH_TABS.superadmin}>
                                <SuperAdminForm session={sessionUser.data} />
                            </Tabs.Panel>
                        )}

                        <Tabs.Panel value={AUTH_TABS.listOrganizations}>
                            <ListOrganizations
                                canDeleteOrg={
                                    permissions?.canDeleteOrganization
                                }
                            />
                        </Tabs.Panel>

                        <Tabs.Panel value={AUTH_TABS.manageMembers}>
                            <MembersTable
                                canUpdateMembers={
                                    permissions?.canManageOrganization
                                }
                                canCreateOwner={permissions?.canCreateOwner}
                            />
                        </Tabs.Panel>
                    </>
                )}

                <Tabs.Panel value={AUTH_TABS.default} pt="sm">
                    <Stack>
                        <Text fw={700} ta="center">
                            This is the Authentication Drawer. Select a Tab to
                            start.
                        </Text>
                        {sessionUser.data?.user && (
                            <Group justify="space-around">
                                <Mark className={publicStyles.highlightText}>
                                    current user: {sessionUser.data.user.name}
                                </Mark>
                                <LogoutButton session={sessionUser} />
                            </Group>
                        )}
                    </Stack>
                </Tabs.Panel>
            </ScrollArea>
        </Tabs>
    );
}
