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
        // check platform wide (most permissive)
        const result = await auth.api.userHasPermission({
            headers: await headers(),
            body: {
                permissions: {
                    [resource]: permissions,
                },
            },
        });

        if (result.success) {
            return result.success;
        }

        // check org specific
        const orgResult = await auth.api.hasPermission({
            headers: await headers(),
            body: {
                permissions: {
                    [resource]: permissions,
                },
            },
        });

        return orgResult.success;
    } catch (error) {
        console.log("Permission Check Failed:", {
            resource,
            permissions,
            error,
        });

        return false;
    }
}
