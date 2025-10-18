// lib/auth/policies/organization-policy.ts

import { PermissionsForResource } from "@/types/permissions";
import { authClient } from "../../auth-client";

export class SitePolicy {
    public static async hasSitePermission(
        permissions: PermissionsForResource<"site">[]
    ): Promise<boolean> {
        try {
            const result = await authClient.organization.hasPermission({
                permissions: {
                    site: permissions,
                },
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            console.error(result.data.success)

            return result.data.success;
            
        } catch (error) {
            console.error("Permission check failed:", error);

            return false;
        }
    }
}
