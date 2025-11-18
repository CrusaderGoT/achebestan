// ============================================================
// lib/auth/policies/base-policy.ts
"use server";

import { auth } from "@/lib/auth";
import {
    PermissionResource,
    PermissionsForResource,
} from "@/types/permissions";
import { headers } from "next/headers";

/**
 * Base permission checking function for server-side use
 */
export async function hasPermission<R extends PermissionResource>(
    resource: R,
    permissions: PermissionsForResource<R>[]
): Promise<boolean> {
    try {
        const result = await auth.api.userHasPermission({
            headers: await headers(),
            body: {
                permission: {
                    [resource]: permissions,
                },
            },
        });

        return result.success;
    } catch (error) {
        console.log("Permission Check Failed:", {
            resource,
            permissions,
            error,
        });

        return false;
    }
}
