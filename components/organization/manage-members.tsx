"use client";

import { useCentralizedAuth } from "@/lib/auth/centralized-auth-context-provider";
import { ActionIcon, Avatar, Table } from "@mantine/core";
import { IconDots } from "@tabler/icons-react";
import dayjs from "dayjs";

export function ManageMembers() {
    const orgData = useCentralizedAuth().currentOrganization.data;

    if (!orgData || orgData.members.length === 0) return null;

    const rows = orgData.members.map((m) => (
        <Table.Tr key={m.id}>
            <Table.Td>
                <Avatar size={"sm"} src={m.user.image} />
            </Table.Td>
            <Table.Td>{m.user.name}</Table.Td>
            <Table.Td>{m.role}</Table.Td>
            <Table.Td>{dayjs(m.createdAt).format("DD/MM/YYYY")}</Table.Td>
            <Table.Td>
                <ActionIcon variant="transparent" size={"sm"}>
                    <IconDots />
                </ActionIcon>
            </Table.Td>
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
                    Memebers of the organization: {orgData.name}
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
