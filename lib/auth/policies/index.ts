// ============================================================
// lib/auth/policies/index.ts

/**
 * Centralized export for all policies
 */
export { hasPermission } from "./base-policy";

export {
    canCreateComment,
    canDeleteOwnComment,
    canDeleteAllComment,
    canUpdateComment
} from "./comment-policy";

export {
    canCreateOrganization,
    canCreateSuperAdmin,
    canDeleteOrganization,
    canManageOrganization
} from "./site-policy";

export {
    canCreateStory,
    canDeleteStory, canSuspendStory, canUpdateStory
} from "./story-policy";

