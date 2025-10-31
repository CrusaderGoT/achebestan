// lib/auth/policies/base-policy.ts

import {
    PermissionResource,
    PermissionsForResource,
} from "@/types/permissions";
import { authClient } from "../../auth-client";

export class BasePolicy {
    public static async hasPermission<R extends PermissionResource>(
        resource: R,
        permissions: PermissionsForResource<R>[]
    ): Promise<boolean> {
        try {
            const result = await authClient.organization.hasPermission({
                permissions: {
                    [resource]: permissions,
                },
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return result.data.success;
        } catch (error) {
            console.error("Permission check failed:", error);

            return false;
        }
    }
}