"use client";

import { makeUserOwnerOfOrganizationIfNonExist } from "@/lib/actions/auth";
import { authClient } from "@/lib/auth-client";
import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import {
    ActionIcon,
    Avatar,
    Center,
    Loader,
    Menu,
    Table,
    Text,
} from "@mantine/core";
import { randomId } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconDots } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useMemo } from "react";

export function MembersTable({
    canUpdateMembers,
}: {
    canUpdateMembers: boolean | undefined;
}) {
    const orgData = useCentralizedAuth().currentOrganization;

    if (orgData.isPending) {
        return (
            <Center>
                <Loader />
            </Center>
        );
    }

    if (!orgData.data || orgData.data.members.length === 0) {
        return <Text>No Members Yet...</Text>;
    }

    const rows = orgData.data.members.map((m) => (
        <Table.Tr key={m.id}>
            <Table.Td>
                <Avatar size={"sm"} src={m.user.image} />
            </Table.Td>

            <Table.Td>{m.user.name}</Table.Td>

            <Table.Td>{m.role}</Table.Td>

            <Table.Td>{dayjs(m.createdAt).format("DD/MM/YYYY")}</Table.Td>

            {canUpdateMembers && (
                <Table.Td>
                    <ManageMembers {...m} />
                </Table.Td>
            )}
        </Table.Tr>
    ));

    return (
        <Table.ScrollContainer minWidth={300} maxHeight={300}>
            <Table
                stickyHeader
                stickyHeaderOffset={0}
                withTableBorder
                highlightOnHover
            >
                <Table.Caption>
                    Memebers of the organization: {orgData.data.name}
                </Table.Caption>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th></Table.Th>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Role</Table.Th>
                        <Table.Th>Joined</Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Table.ScrollContainer>
    );
}

type OrgRole = "member" | "admin" | "owner" | "writer";

type ManageMemberProps = {
    member: NonNullable<
        ReturnType<typeof useCentralizedAuth>["currentOrganization"]["data"]
    >["members"][number];
    rolesToAction: OrgRole[];
    existingMemberRoles: OrgRole[];
    action: "add" | "remove";
};

export function ManageMembers({ ...member }: ManageMemberProps["member"]) {
    const [availableRolesToAdd, availableRolesToRemove, existingMemberRoles] =
        useMemo(() => {
            const allRoles: OrgRole[] = ["member", "admin", "writer"];

            const memberRoles = member.role.split(",") as OrgRole[];

            const availableToAdd = allRoles.filter(
                (r) => !memberRoles.includes(r),
            );

            const availableToRemove = allRoles.filter((r) =>
                memberRoles.includes(r),
            );

            return [availableToAdd, availableToRemove, memberRoles];
        }, [member.role]);

    return (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <ActionIcon variant="transparent" size={"sm"}>
                    <IconDots />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Sub closeDelay={150}>
                    <Menu.Sub.Target>
                        <Menu.Sub.Item>Roles</Menu.Sub.Item>
                    </Menu.Sub.Target>

                    <Menu.Sub.Dropdown>
                        {availableRolesToAdd.length !== 0 && (
                            <Menu.Sub closeDelay={150}>
                                <Menu.Sub.Target>
                                    <Menu.Sub.Item>Add</Menu.Sub.Item>
                                </Menu.Sub.Target>

                                <Menu.Sub.Dropdown>
                                    <AssignOrRemoveOrganizationRole
                                        member={member}
                                        rolesToAction={availableRolesToAdd}
                                        existingMemberRoles={
                                            existingMemberRoles
                                        }
                                        action="add"
                                    />
                                </Menu.Sub.Dropdown>
                            </Menu.Sub>
                        )}

                        {availableRolesToRemove.length !== 0 && (
                            <Menu.Sub closeDelay={150}>
                                <Menu.Sub.Target>
                                    <Menu.Sub.Item>Remove</Menu.Sub.Item>
                                </Menu.Sub.Target>

                                <Menu.Sub.Dropdown>
                                    <AssignOrRemoveOrganizationRole
                                        member={member}
                                        rolesToAction={availableRolesToRemove}
                                        existingMemberRoles={
                                            existingMemberRoles
                                        }
                                        action="remove"
                                    />
                                </Menu.Sub.Dropdown>
                            </Menu.Sub>
                        )}
                    </Menu.Sub.Dropdown>
                </Menu.Sub>

                <MakeMemberOwner {...member} />
            </Menu.Dropdown>
        </Menu>
    );
}

function AssignOrRemoveOrganizationRole({
    member,
    rolesToAction,
    existingMemberRoles,
    action,
}: ManageMemberProps) {
    return rolesToAction.map((r) => {
        // Calculate updateRoles fresh for each role action
        const updateRoles =
            action === "remove"
                ? existingMemberRoles.filter((ur) => ur !== r)
                : existingMemberRoles.includes(r)
                  ? existingMemberRoles
                  : [...existingMemberRoles, r];

        return (
            <Menu.Item
                key={randomId()}
                onClick={async () => {
                    try {
                        const { error } =
                            await authClient.organization.updateMemberRole({
                                role: updateRoles,
                                memberId: member.id,
                                organizationId: member.organizationId,
                            });

                        if (error) {
                            notifications.show({
                                message: `${
                                    error.message || "An Error Occurred"
                                }`,
                            });
                        } else {
                            notifications.show({
                                message: `Successfully ${
                                    action === "add" ? "Added" : "Removed"
                                } Role: ${r}`,
                            });
                        }
                    } catch {
                        notifications.show({
                            message: `Failed To ${
                                action === "add" ? "Add" : "Remove"
                            } Role`,
                        });
                    }
                }}
            >
                <Text>{r}</Text>
            </Menu.Item>
        );
    });
}

export function MakeMemberOwner({ ...member }: ManageMemberProps["member"]) {
    return (
        <Menu.Item
            onClick={async () => {
                const data = await makeUserOwnerOfOrganizationIfNonExist(
                    member.id,
                    member.organizationId,
                );

                if (data.sucess) {
                    notifications.show({
                        message: `Successfully Made This User The Owner Of This Organization`,
                    });
                } else if (data.failure) {
                    notifications.show({
                        message: `Cannot Make This User The Owner Of This Organization, Or An Owner Already Exists.`,
                        color: "red",
                    });
                } else {
                    notifications.show({
                        message: `Failed To Make This User The Owner Of This Organization`,
                        color: "red",
                    });
                }
            }}
        >
            make owner
        </Menu.Item>
    );
}
