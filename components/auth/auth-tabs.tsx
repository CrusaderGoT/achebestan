// For file /tabs/[activeTab].tsx
"use client";

import { AnonymousSignin } from "@/components/auth/anonymous-signin";
import { useCentralizedAuth } from "@/lib/auth/centralized-auth-context-provider";
import {
    canCreateOrganization,
    canCreateSuperAdmin,
    canDeleteOrganization,
    canManageOrganization,
} from "@/lib/auth/policies";
import { LoginFormState } from "@/types/user";
import {
    Center,
    Divider,
    Loader,
    ScrollArea,
    Stack,
    Tabs,
    Text,
} from "@mantine/core";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { OrganizationCreateForm } from "../forms/organization/create-organization-form";
import { LoginForm } from "../forms/user/login-form";
import { SignupForm } from "../forms/user/signup-form";
import { SuperAdminForm } from "../forms/user/super-admin-form";
import { ListOrganizations } from "../organization/list-organizations";
import { MembersTable } from "../organization/manage-members";

type AuthTabsProps = {
    closeDrawer?: () => void;
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
    listOrganizations: "fifth",
    manageMembers: "sixth",
};

type SitePermissionsType = {
    canCreateOrganization: boolean;
    canDeleteOrganization: boolean;
    canManageOrganization: boolean;
    canCreateSuperAdmin: boolean;
};

export function AuthTabs({
    loginFormState,
    setLoginFormState,
    closeDrawer: closeModal,
    signupFormState,
    setSignupFormState,
}: AuthTabsProps) {
    const { sessionUser, currentOrganization } = useCentralizedAuth();

    const noPermissions: SitePermissionsType = useMemo(
        () => ({
            canCreateOrganization: false,
            canCreateSuperAdmin: false,
            canManageOrganization: false,
            canDeleteOrganization: false,
        }),
        []
    );

    const [permissions, setPermissions] =
        useState<SitePermissionsType>(noPermissions);

    //useEffect for assigning permission
    useEffect(() => {
        async function getSitePermissions(): Promise<SitePermissionsType> {
            if (
                !currentOrganization.data?.id ||
                currentOrganization.isPending ||
                !sessionUser.data?.user.id
            ) {
                return noPermissions;
            }

            const [
                createOrganization,
                manageOrganization,
                deleteOrganization,
                createSuperAdmin,
            ] = await Promise.all([
                await canCreateOrganization(),
                await canManageOrganization(),
                await canDeleteOrganization(),
                await canCreateSuperAdmin(),
            ]);

            return {
                canCreateOrganization: createOrganization,
                canManageOrganization: manageOrganization,
                canDeleteOrganization: deleteOrganization,
                canCreateSuperAdmin: createSuperAdmin,
            };
        }
        getSitePermissions().then(setPermissions);
    }, [
        currentOrganization.data?.id,
        currentOrganization.isPending,
        sessionUser.data?.user.id,
        noPermissions,
    ]);

    if (sessionUser.isPending || currentOrganization.isPending) {
        return (
            <Center>
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
                        {permissions.canCreateOrganization && (
                            <Tabs.Tab
                                value={AUTH_TABS.organization}
                                color="white"
                            >
                                Create Organization
                            </Tabs.Tab>
                        )}

                        {permissions.canCreateSuperAdmin && (
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
                        {/** only show organization tabs to superadmin*/}
                        {permissions.canCreateOrganization && (
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
                        )}

                        {permissions.canCreateSuperAdmin && (
                            <Tabs.Panel value={AUTH_TABS.superadmin}>
                                <SuperAdminForm session={sessionUser.data} />
                            </Tabs.Panel>
                        )}

                        <Tabs.Panel value={AUTH_TABS.listOrganizations}>
                            <ListOrganizations
                                activeOrg={
                                    currentOrganization.data
                                        ? {
                                              id: currentOrganization.data.id,
                                              slug: currentOrganization.data
                                                  .slug,
                                          }
                                        : null
                                }
                                canDeleteOrg={permissions.canDeleteOrganization}
                            />
                        </Tabs.Panel>

                        <Tabs.Panel value={AUTH_TABS.manageMembers}>
                            <MembersTable
                                canUpdateMembers={
                                    permissions.canManageOrganization
                                }
                            />
                        </Tabs.Panel>
                    </>
                )}

                <Tabs.Panel value={AUTH_TABS.default} pt="sm">
                    <Text fw={700} ta="center">
                        This is the Authentication Drawer. Select a Tab to
                        start. Current User:{" "}
                        {currentOrganization.data?.members.map((m) => m.role)}
                    </Text>
                </Tabs.Panel>
            </ScrollArea>
        </Tabs>
    );
}
