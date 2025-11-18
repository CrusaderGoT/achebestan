// ============================================================
// lib/auth/policies/index.ts

/**
 * Centralized export for all policies
 */
export { hasPermission } from "./base-policy";

export {
    canCreateComment,
    canDeleteComment,
    canUpdateComment,
} from "./comment-policy";

export {
    canCreateOrganization,
    canCreateSuperAdmin,
    canDeleteOrganization,
    canManageOrganization,
} from "./organization-policy";
