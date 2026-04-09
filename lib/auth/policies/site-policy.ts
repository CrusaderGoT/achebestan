// ============================================================
// lib/auth/policies/organization-policy.ts
"use server";

import { hasPermission } from "./base-policy";

/**
 * Check if user can create organizations
 */
export async function canCreateOrganization(): Promise<boolean> {
    return hasPermission("site", ["create:organization"]);
}

/**
 * Check if user can manage organization
 */
export async function canManageOrganization(): Promise<boolean> {
    return hasPermission("organization", ["update"]);
}

/**
 * Check if user can delete organizations
 */
export async function canDeleteOrganization(): Promise<boolean> {
    return hasPermission("organization", ["delete"]);
}

/**
 * Check if user can create super admin users
 */
export async function canCreateSuperAdmin(): Promise<boolean> {
    return hasPermission("site", ["create:superadmin"]);
}

/**
 * Check if user can create super admin users
 */
export async function canMakeOwner(): Promise<boolean> {
    return hasPermission("site", ["update:role"]);
}

export async function getSitePermissions({
    currentOrganizationId,
    userId,
}: {
    currentOrganizationId: string | undefined;
    userId: string | undefined;
}): Promise<SitePermissionsType> {
    const noPermissions: SitePermissionsType = {
        canCreateOrganization: false,
        canCreateSuperAdmin: false,
        canManageOrganization: false,
        canDeleteOrganization: false,
    };

    if (!currentOrganizationId || !userId) {
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

export type SitePermissionsType = {
    canCreateOrganization: boolean;
    canDeleteOrganization: boolean;
    canManageOrganization: boolean;
    canCreateSuperAdmin: boolean;
};
