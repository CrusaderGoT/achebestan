// ============================================================
// lib/auth/policies/organization-policy.ts

import { BasePolicy } from "./base-policy";

/**
 * Policy class for organization-related authorization
 */
export class OrganizationPolicy extends BasePolicy {
    /**
     * Check if user can create organizations
     */
    public async canCreate(): Promise<boolean> {
        return this.hasPermission("site", ["create:organization"]);
    }

    /**
     * Check if user can create super admin users
     */
    public async canCreateSuperAdmin(): Promise<boolean> {
        return this.hasPermission("site", ["create:superadmin"]);
    }

    /**
     * Check if user can manage organization settings
     */
    public async canManageSettings(): Promise<boolean> {
        return this.hasPermission("organization", ["update"]);
    }

    /**
     * Check if user can delete organizations
     */
    public async canDelete(): Promise<boolean> {
        return this.hasPermission("organization", ["delete"]);
    }
}
