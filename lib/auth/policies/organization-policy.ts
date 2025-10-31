// lib/auth/policies/organization-policy.ts

import { BasePolicy } from "./base-policy";

export class OrganizationPolicy extends BasePolicy {
    public async canCreateOrg(): Promise<boolean> {
        return await OrganizationPolicy.hasPermission("site", [
            "create:organization",
        ]);
    }

    public async canCreateSuperUser(): Promise<boolean> {
        return await OrganizationPolicy.hasPermission("site", [
            "create:superadmin",
        ]);
    }
}
