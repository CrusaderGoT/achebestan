// lib/auth/policies/base-policy.ts

import {
    PermissionResource,
    PermissionsForResource,
} from "@/types/permissions";
import { authClient } from "../../auth-client";

/**
 * Custom error for permission check failures
 */
export class PermissionCheckError extends Error {
    constructor(
        message: string,
        public readonly resource: string,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = "PermissionCheckError";
    }
}

/**
 * Base policy class providing permission checking functionality
 */
export abstract class BasePolicy {
    /**
     * Check if user has the specified permission for a resource
     *
     * @throws {PermissionCheckError} When permission check fails due to system error
     * @returns {Promise<boolean>} true if user has permission, false otherwise
     */
    protected async hasPermission<R extends PermissionResource>(
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
                throw new PermissionCheckError(
                    result.error.message || "Error Checking If Has Permission",
                    resource,
                    result.error
                );
            }

            return result.data?.success ?? false;
        } catch (error) {
            if (error instanceof PermissionCheckError) {
                throw error;
            }

            // Log unexpected errors but don't expose details to caller
            console.error("Permission check failed:", {
                resource,
                permissions,
                error,
            });

            throw new PermissionCheckError(
                "Failed to check permissions",
                resource,
                error
            );
        }
    }

    /**
     * Check if user has ANY of the specified permissions
     */
    protected async hasAnyPermission<R extends PermissionResource>(
        resource: R,
        permissionSets: PermissionsForResource<R>[][]
    ): Promise<boolean> {
        const results = await Promise.all(
            permissionSets.map((perms) => this.hasPermission(resource, perms))
        );
        return results.some((hasPermission) => hasPermission);
    }

    /**
     * Check if user has ALL of the specified permissions
     */
    protected async hasAllPermissions<R extends PermissionResource>(
        resource: R,
        permissionSets: PermissionsForResource<R>[][]
    ): Promise<boolean> {
        const results = await Promise.all(
            permissionSets.map((perms) => this.hasPermission(resource, perms))
        );
        return results.every((hasPermission) => hasPermission);
    }

    /**
     * Safely check permission with fallback to false on error
     * Use this when you want to fail gracefully instead of throwing
     */
    protected async hasPermissionSafe<R extends PermissionResource>(
        resource: R,
        permissions: PermissionsForResource<R>[]
    ): Promise<boolean> {
        try {
            return await this.hasPermission(resource, permissions);
        } catch (error) {
            console.error("Permission check failed (safe mode):", error);
            return false;
        }
    }
}

// ============================================================
// Example usage:

/*
// In your route handler or service:

import { CommentPolicy } from "@/lib/auth/policies";

// Example 1: Check if user can create comment
const policy = CommentPolicy.create(currentUser);
const canCreate = await policy.canCreate();

if (!canCreate) {
    throw new Error("Unauthorized");
}

// Example 2: Check if user can delete comment
const deletePolicy = CommentPolicy.create(currentUser, comment);
const canDelete = await deletePolicy.canDelete();

if (!canDelete) {
    throw new Error("Unauthorized");
}

// Example 3: Handle permission errors
try {
    const organizationPolicy = new OrganizationPolicy();
    const canCreateOrg = await organizationPolicy.canCreate();
} catch (error) {
    if (error instanceof PermissionCheckError) {
        // Handle permission check failure
        console.error("Permission check failed:", error.message);
    }
}
*/
